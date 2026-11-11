import React, { useCallback, useEffect, useRef, useState } from "react"
import { useAppStore } from '@/store/appStore'
import { supabase } from '@/lib/supabase'
import { useTasks, useTaskLists, useTaskMutations } from '@/queries/tasks'
import { useNotes, useNoteMutations } from '@/queries/notes'
import type { Task } from '@/types/task'
import type { Note } from '@/types/note'
import LoadingIndicator from '@/components/LoadingIndicator'
import {
  Check,
  Clipboard,
  ChevronDown,
  CircleAlert,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Square,
  Trash2,
  X,
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Pulsar } from 'ldrs/react'
import 'ldrs/react/Pulsar.css'
import {
  ASSISTANT_ATTACHMENT_MAX_COUNT,
  ASSISTANT_ATTACHMENT_MAX_FILE_SIZE,
  ASSISTANT_ATTACHMENT_MAX_TOTAL_SIZE,
  type AssistantConversation,
  type StoredAssistantAttachment,
  createAssistantConversation,
  deleteAssistantConversation,
  deleteAssistantMessages,
  loadAssistantConversations,
  loadAssistantConversationsWithMessages,
  loadAssistantMessages,
  readAssistantAttachment,
  renameAssistantConversation,
  saveAssistantMessage,
  saveAssistantProposals,
  searchAssistantConversations,
  uploadAssistantAttachments,
} from '@/lib/assistantConversations'

type AiChat = {
  id: string,
  role: 'user' | 'assistant',
  message: string,
  proposals?: AssistantProposal[],
  attachments?: StoredAssistantAttachment[],
  createdAt?: string,
}

type TaskPriority = 'low' | 'medium' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
type TaskField = 'title' | 'description' | 'due_at' | 'priority' | 'status' | 'task_list_id'

type ProposedAction =
  | { action: 'create_task'; summary: string; title: string; description: string; due_at: string | null; priority: TaskPriority; status: TaskStatus; task_list_id: string | null }
  | { action: 'update_task'; summary: string; task_id: string; title: string; description: string; due_at: string | null; priority: TaskPriority; status: TaskStatus; task_list_id: string | null; changed_fields: TaskField[] }
  | { action: 'delete_task'; summary: string; task_id: string }
  | { action: 'create_note'; summary: string; title: string; body: string }
  | { action: 'update_note'; summary: string; note_id: string; title: string; body: string }
  | { action: 'delete_note'; summary: string; note_id: string }

type AssistantProposal = {
  id: string
  action: ProposedAction
  status: 'pending' | 'applying' | 'applied' | 'dismissed' | 'failed'
  error?: string
}

type FailedRequest = {
  conversationId: string
  userMessage: string
  previousMessages: AiChat[]
  userId: string
  assistantMessageId: string
  userMessageId: string
  attachments: StoredAssistantAttachment[]
  attachmentData: { name: string; mime_type: string; data: string }[]
}

type PendingAttachment = {
  file: File
  previewUrl?: string
}

const formatMessageTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getAssistantErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  if (isRecord(error) && typeof error.message === 'string') return error.message
  return fallback
}

const emptyConversationStorageKey = (userId: string, conversationId: string) =>
  `skald_empty_chat:${userId}:${conversationId}`

const parseProposals = (value: unknown): AssistantProposal[] => {
  if (!Array.isArray(value)) return []
  return value.slice(0, 3).flatMap((item): AssistantProposal[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || !isRecord(item.action)) return []
    const action = item.action
    if (typeof action.summary !== 'string') return []
    const base = { id: item.id, summary: action.summary }
    const status = ['pending', 'applying', 'applied', 'dismissed', 'failed'].includes(String(item.status))
      ? item.status as AssistantProposal['status']
      : 'pending'
    const error = typeof item.error === 'string' ? item.error : undefined
    const makeProposal = (proposalAction: ProposedAction): AssistantProposal => ({
      ...base,
      action: proposalAction,
      status,
      ...(error ? { error } : {}),
    })
    switch (action.action) {
      case 'create_task':
        if (typeof action.title !== 'string' || typeof action.description !== 'string'
          || !['low', 'medium', 'high'].includes(String(action.priority))
          || !['pending', 'in_progress', 'done', 'cancelled'].includes(String(action.status))
          || !(action.due_at === null || typeof action.due_at === 'string')
          || !(action.task_list_id === null || typeof action.task_list_id === 'string')) return []
        return [makeProposal(action as ProposedAction)]
      case 'update_task': {
        if (typeof action.task_id !== 'string' || typeof action.title !== 'string'
          || typeof action.description !== 'string'
          || !['low', 'medium', 'high'].includes(String(action.priority))
          || !['pending', 'in_progress', 'done', 'cancelled'].includes(String(action.status))
          || !(action.due_at === null || typeof action.due_at === 'string')
          || !(action.task_list_id === null || typeof action.task_list_id === 'string')) return []
        const validTaskFields = ['title', 'description', 'due_at', 'priority', 'status', 'task_list_id']
        const changedFields = Array.isArray(action.changed_fields)
          && action.changed_fields.every((field) => validTaskFields.includes(String(field)))
          ? action.changed_fields as TaskField[]
          : validTaskFields as TaskField[]
        return [makeProposal({ ...action, changed_fields: changedFields } as ProposedAction)]
      }
      case 'delete_task':
        return typeof action.task_id === 'string'
          ? [makeProposal(action as ProposedAction)]
          : []
      case 'create_note':
        return typeof action.title === 'string' && typeof action.body === 'string'
          ? [makeProposal(action as ProposedAction)]
          : []
      case 'update_note':
        return typeof action.note_id === 'string' && typeof action.title === 'string'
          && typeof action.body === 'string'
          ? [makeProposal(action as ProposedAction)]
          : []
      case 'delete_note':
        return typeof action.note_id === 'string'
          ? [makeProposal(action as ProposedAction)]
          : []
      default:
        return []
    }
  })
}

const getTaskDateTime = (value: string | null) => {
  if (!value) return { date: '', time: '' }
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
}

const taskStatusLabel: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled'
}

const taskPriorityLabel: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const getProposalDetails = (
  action: ProposedAction,
  tasks: Task[],
  notes: Note[],
  taskLists: { id: string; name: string }[]
) => {
  const taskListName = (id: string | null) => taskLists.find((list) => list.id === id)?.name ?? 'No list'
  switch (action.action) {
    case 'create_task':
    case 'update_task':
      return [
        ...(action.action === 'update_task'
          ? [`Updating: ${tasks.find((task) => task._id === action.task_id)?.title ?? 'Task no longer available'}`]
          : []),
        `Title: ${action.title}`,
        `Description: ${action.description || 'None'}`,
        `Due: ${action.due_at ? new Date(action.due_at).toLocaleString() : 'No due date'}`,
        `Priority: ${taskPriorityLabel[action.priority]}`,
        `Status: ${taskStatusLabel[action.status]}`,
        `List: ${taskListName(action.task_list_id)}`
      ].join('\n')
    case 'delete_task':
      return `Task: ${tasks.find((task) => task._id === action.task_id)?.title ?? 'Task no longer available'}`
    case 'create_note':
      return `Title: ${action.title}\n\n${action.body}`
    case 'update_note':
      return `Updating: ${notes.find((note) => note._id === action.note_id)?.title ?? 'Note no longer available'}\n\nTitle: ${action.title}\n\n${action.body}`
    case 'delete_note':
      return `Note: ${notes.find((note) => note._id === action.note_id)?.title ?? 'Note no longer available'}`
  }
}

const loadLegacyConversation = (userId: string): AiChat[] => {
  try {
    const storedConvo = localStorage.getItem(`skald_ai_chat:${userId}`)
    if (!storedConvo) return []
    const parsedConvo: unknown = JSON.parse(storedConvo)
    if (!Array.isArray(parsedConvo)) return []

    const messages = parsedConvo.flatMap((item: unknown, index): AiChat[] => {
      if (!item || typeof item !== 'object' || !('message' in item) || typeof item.message !== 'string') {
        return []
      }
      const id = 'id' in item && typeof item.id === 'string' ? item.id : `restored-${index}`
      const role = 'role' in item && (item.role === 'user' || item.role === 'assistant')
        ? item.role
        : 'id' in item && typeof item.id === 'number' && item.id % 2 === 1
          ? 'user'
          : 'assistant'
      return [{ id, role, message: item.message }]
    })
    return messages.filter((message) => message.id !== 'welcome').slice(-100)
  } catch (error) {
    console.error('Unable to restore Mr Groff conversation:', error)
    return []
  }
}

const Assistant = () => {
  const user = useAppStore((state) => state.user)
  const userId = user?.id
  const [conversations, setConversations] = useState<AssistantConversation[]>([])
  const [visibleConversations, setVisibleConversations] = useState<AssistantConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [convo, setConvo] = useState<AiChat[]>([])
  const [historySearch, setHistorySearch] = useState('')
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyLoadFailed, setHistoryLoadFailed] = useState(false)
  const [historyReloadToken, setHistoryReloadToken] = useState(0)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messagesReloadToken, setMessagesReloadToken] = useState(0)
  const [messagesReady, setMessagesReady] = useState(false)
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([])
  const [editingAttachments, setEditingAttachments] = useState<StoredAssistantAttachment[]>([])
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [responseLoading, setResponseLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const historyMenuRef = useRef<HTMLElement>(null)
  const historyPickerRef = useRef<HTMLDivElement>(null)
  const historyTriggerRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const applyingProposals = useRef(new Set<string>())
  const requestController = useRef<AbortController | null>(null)
  const creatingConversationRef = useRef(false)
  const failedRequest = useRef<FailedRequest | null>(null)
  const pendingNewChatRef = useRef(false)
  const activeConversationRef = useRef<string | null>(null)
  const knownEmptyConversationsRef = useRef(new Set<string>())
  const messageLoadRef = useRef(0)
  const convoRef = useRef<AiChat[]>([])
  const pendingPreviewUrlsRef = useRef(new Set<string>())

  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const tasksQuery = useTasks(userId)
  const notesQuery = useNotes(userId)
  const taskListsQuery = useTaskLists(userId)
  const tasks = tasksQuery.data ?? []
  const notes = notesQuery.data ?? []
  const taskLists = taskListsQuery.data ?? []
  const contextLoading = tasksQuery.isLoading || notesQuery.isLoading || taskListsQuery.isLoading
  const contextError = tasksQuery.error ?? notesQuery.error ?? taskListsQuery.error
  const { addTask, editTask, deleteTask } = useTaskMutations(userId)
  const { addNote, editNote, deleteNote } = useNoteMutations(userId)
  const conversationIdForDisplay = activeConversationId
  const isEmptyConversation = userId && conversationIdForDisplay
    ? knownEmptyConversationsRef.current.has(conversationIdForDisplay)
      || localStorage.getItem(emptyConversationStorageKey(userId, conversationIdForDisplay)) === 'true'
    : false
  const isInitialChat = !conversationIdForDisplay
    || isEmptyConversation
    || (messagesReady && convo.length === 0)
  const isLoadingConversation = Boolean(conversationIdForDisplay)
    && !isEmptyConversation
    && (historyLoading || messagesLoading)
  const messagesToShow = convo

  useEffect(() => {
    convoRef.current = convo
  }, [convo])

  useEffect(() => () => {
    for (const url of pendingPreviewUrlsRef.current) URL.revokeObjectURL(url)
    pendingPreviewUrlsRef.current.clear()
  }, [])

  useEffect(() => {
    if (!userId) {
      setConversations([])
      setVisibleConversations([])
      setActiveConversationId(null)
      activeConversationRef.current = null
      setConvo([])
      setHistoryLoading(false)
      setHistoryLoadFailed(false)
      setMessagesLoading(false)
      setMessagesError(null)
      pendingNewChatRef.current = false
      creatingConversationRef.current = false
      setCreatingConversation(false)
      return
    }

    let cancelled = false
    setHistoryLoading(true)
    setHistoryLoadFailed(false)
    setHistoryError(null)
    setMessagesLoading(false)
    setMessagesError(null)
    setConversations([])
    setActiveConversationId(null)
    activeConversationRef.current = null
    setConvo([])
    requestController.current?.abort()
    setRequestError(null)
    setResponseLoading(false)
    failedRequest.current = null
    const loadHistory = async () => {
      try {
        let allItems = await loadAssistantConversations(userId)
        let items = await loadAssistantConversationsWithMessages(userId, allItems)
        if (!allItems.length) {
          const legacyMessages = loadLegacyConversation(userId)
          if (legacyMessages.length) {
            const firstUserMessage = legacyMessages.find((message) => message.role === 'user')?.message
            const title = firstUserMessage?.trim().replace(/\s+/g, ' ').slice(0, 72) || 'New chat'
            const created = await createAssistantConversation(userId, title)
            for (const message of legacyMessages.filter((entry) => entry.message.trim())) {
              await saveAssistantMessage(userId, created.id, {
                id: crypto.randomUUID(),
                role: message.role,
                content: message.message,
              })
            }
            localStorage.removeItem(`skald_ai_chat:${userId}`)
            allItems = await loadAssistantConversations(userId)
            items = await loadAssistantConversationsWithMessages(userId, allItems)
          }
        }
        if (cancelled) return
        setConversations(items)
        setVisibleConversations(items)
        activeConversationRef.current = null
        setActiveConversationId(null)
        setConvo([])
        setMessagesReady(true)
        setMessagesLoading(false)
        setHistoryLoadFailed(false)
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to load Mr Groff conversation history:', error)
          setHistoryError(getAssistantErrorMessage(error, 'Unable to load chat history.'))
          setHistoryLoadFailed(true)
        }
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    void loadHistory()
    return () => {
      cancelled = true
      requestController.current?.abort()
    }
  }, [historyReloadToken, userId])

  useEffect(() => {
    if (!userId) {
      setConvo([])
      setMessagesReady(false)
      setMessagesLoading(false)
      setMessagesError(null)
      return
    }
    if (historyLoading || historyLoadFailed) return
    if (!activeConversationId) {
      setConvo([])
      setMessagesReady(false)
      setMessagesLoading(false)
      setMessagesError(null)
      return
    }
    if (knownEmptyConversationsRef.current.has(activeConversationId)) {
      convoRef.current = []
      setConvo([])
      setMessagesReady(true)
      setMessagesLoading(false)
      setMessagesError(null)
      return
    }
    let cancelled = false
    const loadId = ++messageLoadRef.current
    setMessagesLoading(true)
    setMessagesError(null)
    setMessagesReady(false)
    setRequestError(null)
    failedRequest.current = null
    void loadAssistantMessages(userId, activeConversationId).then((messages) => {
      if (cancelled || loadId !== messageLoadRef.current) return
      setConvo(messages.map((message) => ({
        ...message,
        proposals: parseProposals(message.proposals),
      })))
      setMessagesReady(true)
    }).catch((error: unknown) => {
      if (cancelled || loadId !== messageLoadRef.current) return
      console.error('Unable to load Mr Groff messages:', error)
      setMessagesReady(false)
      setMessagesError(getAssistantErrorMessage(error, 'Unable to load this conversation.'))
    }).finally(() => {
      if (!cancelled && loadId === messageLoadRef.current) setMessagesLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [messagesReloadToken, userId, activeConversationId, historyLoading, historyLoadFailed])

  useEffect(() => {
    if (!userId || historyLoading || historyError) return
    let cancelled = false
    const timeout = window.setTimeout(() => {
      void searchAssistantConversations(userId, historySearch).then((items) => {
        if (!cancelled) setVisibleConversations(items)
      }).catch((error: unknown) => {
        if (!cancelled) {
          console.error('Unable to search Mr Groff conversation history:', error)
          setHistoryError(getAssistantErrorMessage(error, 'Unable to search chat history.'))
        }
      })
    }, 160)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [userId, historySearch, conversations, historyLoading, historyError])

  useEffect(() => {
    const textarea = textareaRef.current
    textarea?.focus()
  }, [])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: responseLoading ? 'smooth' : 'auto' })
  }, [convo, responseLoading])

  useEffect(() => {
    if (!historyOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node
        && !historyMenuRef.current?.contains(event.target)
        && !historyPickerRef.current?.contains(event.target)) {
        setHistoryOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false)
        historyTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [historyOpen])

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }

  const aiResponse = async (
    userMessage: string,
    previousMessages: AiChat[],
    userId: string,
    conversationId: string,
    userMessageId: string,
    assistantMessageId: string,
    attachments: StoredAssistantAttachment[],
    attachmentData: { name: string; mime_type: string; data: string }[],
  ) => {
    setResponseLoading(true)
    setRequestError(null)
    const controller = new AbortController()
    requestController.current = controller
    const isCurrentConversation = () =>
      useAppStore.getState().user?.id === userId
      && activeConversationRef.current === conversationId

    try {
      const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL?.replace(/\/+$/, '')
      if (!apiUrl) throw new Error('Mr Groff is not configured. Set VITE_ASSISTANT_API_URL for the web app.')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session || session.user.id !== userId) throw new Error('Your session expired. Sign in again to continue.')

      const history = previousMessages
        .filter((message) => message.id !== 'welcome')
        .slice(-19)
      const previousAttachmentMessage = [...history]
        .reverse()
        .find((message) => message.role === 'user' && message.attachments?.length)
      const historyMessages = await Promise.all(history.map(async ({ id, role, message, proposals, attachments: messageAttachments }) => ({
        role,
        content: (proposals?.length
          ? `${message}\nProposed actions: ${proposals.map((proposal) => proposal.action.summary).join('; ')}`
          : message).slice(0, 4000),
        attachments: id === previousAttachmentMessage?.id && !attachmentData.length
          ? await Promise.all((messageAttachments ?? []).map(async (attachment) => ({
            name: attachment.name,
            mime_type: attachment.mimeType,
            data: await readAssistantAttachment(attachment),
          })))
          : [],
      })))
      const messages = [
        ...historyMessages,
        { role: 'user' as const, content: userMessage, attachments: attachmentData }
      ]
      const res = await fetch(`${apiUrl}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
        signal: controller.signal
      })
      if (!res.ok) {
        const data: { detail?: unknown } = await res.json()
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Mr Groff could not respond. Please try again.')
      }
      if (!res.body) throw new Error('Mr Groff returned an empty stream. Please try again.')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completed: { reply: string; proposals: AssistantProposal[] } | null = null
      const handleEvent = (event: string): { reply: string; proposals: AssistantProposal[] } | null => {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')
        if (!data) return null
        let payload: { type?: unknown; text?: unknown; reply?: unknown; proposals?: unknown; detail?: unknown }
        try {
          payload = JSON.parse(data)
        } catch {
          throw new Error('Mr Groff sent an invalid stream event.')
        }

        if (payload.type === 'delta' && typeof payload.text === 'string') {
          if (isCurrentConversation()) {
            setConvo((current) => current.map((message) => message.id === assistantMessageId
              ? { ...message, message: message.message + payload.text }
              : message))
          }
        } else if (payload.type === 'complete' && typeof payload.reply === 'string') {
          const proposals = parseProposals(payload.proposals)
          return { reply: payload.reply, proposals }
        } else if (payload.type === 'error') {
          throw new Error(typeof payload.detail === 'string' ? payload.detail : 'Mr Groff could not complete that response.')
        }
        return null
      }

      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() ?? ''
        for (const event of events) completed = handleEvent(event) ?? completed
        if (done) break
      }
      if (buffer.trim()) completed = handleEvent(buffer) ?? completed
      if (!completed) throw new Error('Mr Groff ended the response unexpectedly. Please try again.')
      await saveAssistantMessage(userId, conversationId, {
        id: assistantMessageId,
        role: 'assistant',
        content: completed.reply,
        proposals: completed.proposals,
      })
      if (isCurrentConversation()) {
        setConvo((current) => current.map((message) => message.id === assistantMessageId
          ? { ...message, message: completed.reply, proposals: completed.proposals }
          : message))
        const items = await loadAssistantConversations(userId)
        setConversations(await loadAssistantConversationsWithMessages(userId, items))
      }
      failedRequest.current = null
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (isCurrentConversation()) {
          failedRequest.current = {
            conversationId,
            userMessage,
            previousMessages,
            userId,
            assistantMessageId,
            userMessageId,
            attachments,
            attachmentData,
          }
          setRequestError('Response stopped. You can retry it.')
        }
        return
      }
      console.error('Mr Groff request failed:', error)
      if (isCurrentConversation()) {
        failedRequest.current = {
          conversationId,
          userMessage,
          previousMessages,
          userId,
          assistantMessageId,
          userMessageId,
          attachments,
          attachmentData,
        }
        setRequestError(error instanceof Error ? error.message : 'Mr Groff could not respond. Please try again.')
        setConvo((current) => current.filter((message) => message.id !== assistantMessageId || message.message))
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        if (isCurrentConversation()) setResponseLoading(false)
      }
    }
  }

  const updateProposal = async (messageId: string, proposalId: string, update: Partial<AssistantProposal>) => {
    const target = convoRef.current.find((message) => message.id === messageId)
    if (!target?.proposals) return
    const proposals = target.proposals.map((proposal) => proposal.id === proposalId
      ? { ...proposal, ...update }
      : proposal)
    const updatedMessages = convoRef.current.map((message) => message.id === messageId
      ? { ...message, proposals }
      : message)
    convoRef.current = updatedMessages
    setConvo(updatedMessages)
    if (userId && activeConversationId) {
      try {
        await saveAssistantProposals(userId, activeConversationId, messageId, proposals)
      } catch (error) {
        console.error('Unable to save Mr Groff proposal state:', error)
        setRequestError(error instanceof Error ? error.message : 'Unable to save proposal status.')
      }
    }
  }

  const applyProposal = async (messageId: string, proposal: AssistantProposal) => {
    const proposalKey = `${messageId}:${proposal.id}`
    if (proposal.status !== 'pending' || !userId || applyingProposals.current.has(proposalKey)) return
    applyingProposals.current.add(proposalKey)
    await updateProposal(messageId, proposal.id, { status: 'applying', error: undefined })

    try {
      const [latestTasksResult, latestNotesResult, latestListsResult] = await Promise.all([
        tasksQuery.refetch({ throwOnError: true }),
        notesQuery.refetch({ throwOnError: true }),
        taskListsQuery.refetch({ throwOnError: true })
      ])
      if (useAppStore.getState().user?.id !== userId) {
        throw new Error('Your session changed. Sign in again before applying this proposal.')
      }
      const latestTasks = latestTasksResult.data ?? []
      const latestNotes = latestNotesResult.data ?? []
      const latestLists = latestListsResult.data ?? []
      const action = proposal.action
      if (action.action === 'create_task' || action.action === 'update_task') {
        const existing = action.action === 'update_task'
          ? latestTasks.find((task) => task._id === action.task_id)
          : undefined
        if (action.action === 'update_task' && !existing) {
          throw new Error('That task is no longer available. Refresh context and ask Mr Groff again.')
        }
        const list = action.task_list_id
          ? latestLists.find((taskList) => taskList.id === action.task_list_id)
          : undefined
        if (action.task_list_id && !list) {
          throw new Error('That task list is no longer available. Refresh context and ask Mr Groff again.')
        }
        const taskDateTime = getTaskDateTime(action.due_at)
        const task: Task = {
          ...existing,
          _id: action.action === 'update_task' ? action.task_id : undefined,
          title: action.title,
          description: action.description,
          ...taskDateTime,
          priority: taskPriorityLabel[action.priority],
          status: taskStatusLabel[action.status],
          taskList: list?.name ?? '',
          taskListId: list?.id ?? null,
          completed: action.status === 'done',
          completedAt: action.status === 'done' ? existing?.completedAt ?? new Date() : null
        }
        if (action.action === 'create_task') await addTask.mutateAsync(task)
        else await editTask.mutateAsync(task)
      } else if (action.action === 'delete_task') {
        if (!latestTasks.some((task) => task._id === action.task_id)) {
          throw new Error('That task is no longer available. Refresh context and ask Mr Groff again.')
        }
        await deleteTask.mutateAsync(action.task_id)
      } else if (action.action === 'create_note') {
        const note: Note = { title: action.title, description: action.body, image: null }
        await addNote.mutateAsync(note)
      } else if (action.action === 'update_note') {
        const existing = latestNotes.find((note) => note._id === action.note_id)
        if (!existing) throw new Error('That note is no longer available. Refresh context and ask Mr Groff again.')
        await editNote.mutateAsync({
          ...existing,
          title: action.title,
          description: action.body
        })
      } else {
        const existing = latestNotes.find((note) => note._id === action.note_id)
        if (!existing) throw new Error('That note is no longer available. Refresh context and ask Mr Groff again.')
        await deleteNote.mutateAsync(action.note_id)
        if (useAppStore.getState().activeNoteId === action.note_id) setActiveNoteId(null)
      }

      await updateProposal(messageId, proposal.id, { status: 'applied' })
    } catch (error) {
      console.error('Unable to apply Mr Groff proposal:', error)
      await updateProposal(messageId, proposal.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unable to apply this proposal.'
      })
    } finally {
      applyingProposals.current.delete(proposalKey)
    }
  }

  const selectConversation = (conversationId: string) => {
    if (!userId || conversationId === activeConversationRef.current) {
      setHistoryOpen(false)
      return
    }
    requestController.current?.abort()
    requestController.current = null
    failedRequest.current = null
    activeConversationRef.current = conversationId
    messageLoadRef.current += 1
    setActiveConversationId(conversationId)
    setConvo([])
    setMessagesReady(false)
    setMessagesLoading(true)
    setMessagesError(null)
    setResponseLoading(false)
    setSending(false)
    setRequestError(null)
    setHistoryError(null)
    setPrompt('')
    setEditingMessageId(null)
    setEditingAttachments([])
    setHistoryOpen(false)
  }

  const createConversation = useCallback(async () => {
    if (!userId || sending || responseLoading || creatingConversationRef.current) return
    if (historyLoading) {
      pendingNewChatRef.current = true
      setCreatingConversation(true)
      return
    }
    creatingConversationRef.current = true
    setCreatingConversation(true)
    try {
      const conversation = await createAssistantConversation(userId)
      knownEmptyConversationsRef.current.add(conversation.id)
      localStorage.setItem(emptyConversationStorageKey(userId, conversation.id), 'true')
      activeConversationRef.current = conversation.id
      setActiveConversationId(conversation.id)
      setConvo([])
      setMessagesReady(true)
      setMessagesLoading(false)
      setMessagesError(null)
      setRequestError(null)
      setHistoryError(null)
      setPrompt('')
      setEditingMessageId(null)
      failedRequest.current = null
      setHistoryOpen(false)
    } catch (error) {
      console.error('Unable to create a Mr Groff conversation:', error)
      setHistoryError(getAssistantErrorMessage(error, 'Unable to create a new chat.'))
    } finally {
      creatingConversationRef.current = false
      setCreatingConversation(false)
    }
  }, [historyLoading, responseLoading, sending, userId])

  useEffect(() => {
    if (historyLoading || !pendingNewChatRef.current) return
    pendingNewChatRef.current = false
    void createConversation()
  }, [createConversation, historyLoading])

  const saveConversationTitle = async (conversationId: string) => {
    if (!userId) return
    const title = renameDraft.trim().slice(0, 72)
    if (!title) {
      setHistoryError('Chat titles cannot be empty.')
      return
    }
    try {
      await renameAssistantConversation(userId, conversationId, title)
      setConversations((current) => current.map((item) =>
        item.id === conversationId ? { ...item, title } : item))
      setRenamingConversationId(null)
      setRenameDraft('')
      setHistoryError(null)
    } catch (error) {
      console.error('Unable to rename a Mr Groff conversation:', error)
      setHistoryError(getAssistantErrorMessage(error, 'Unable to rename this chat.'))
    }
  }

  const confirmDeleteConversation = async () => {
    const conversationId = deleteConversationId
    if (!conversationId || !userId) return
    try {
      if (conversationId === activeConversationRef.current) {
        requestController.current?.abort()
        requestController.current = null
        failedRequest.current = null
        setResponseLoading(false)
      }
      await deleteAssistantConversation(userId, conversationId)
      const remaining = conversations.filter((item) => item.id !== conversationId)
      setConversations(remaining)
      setDeleteConversationId(null)
      setHistoryError(null)
      if (activeConversationId === conversationId) {
        if (remaining[0]) selectConversation(remaining[0].id)
        else {
          setActiveConversationId(null)
          activeConversationRef.current = null
          setConvo([])
          await createConversation()
        }
      }
    } catch (error) {
      console.error('Unable to delete a Mr Groff conversation:', error)
      setHistoryError(getAssistantErrorMessage(error, 'Unable to delete this chat.'))
    }
  }

  const addPendingFiles = (files: FileList | File[]) => {
    const selected = Array.from(files)
    if (!selected.length) return
    const currentFiles = pendingFiles.map(({ file }) => file)
    const allFiles = [...currentFiles, ...selected]
    if (allFiles.length + editingAttachments.length > ASSISTANT_ATTACHMENT_MAX_COUNT) {
      setAttachmentError(`Attach up to ${ASSISTANT_ATTACHMENT_MAX_COUNT} files per message.`)
      return
    }
    if (allFiles.some((file) => !file.size || file.size > ASSISTANT_ATTACHMENT_MAX_FILE_SIZE)) {
      setAttachmentError('Each attachment must be larger than 0 bytes and no larger than 5 MB.')
      return
    }
    if (allFiles.reduce((total, file) => total + file.size, 0)
      + editingAttachments.reduce((total, attachment) => total + attachment.size, 0)
      > ASSISTANT_ATTACHMENT_MAX_TOTAL_SIZE) {
      setAttachmentError('Attachments in a message cannot exceed 10 MB in total.')
      return
    }

    const additions = selected.map((file): PendingAttachment => {
      if (!file.type.startsWith('image/')) return { file }
      const previewUrl = URL.createObjectURL(file)
      pendingPreviewUrlsRef.current.add(previewUrl)
      return { file, previewUrl }
    })
    setPendingFiles((current) => [...current, ...additions])
    setAttachmentError(null)
  }

  const removePendingFile = (index: number) => {
    const target = pendingFiles[index]
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
      pendingPreviewUrlsRef.current.delete(target.previewUrl)
    }
    setPendingFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setAttachmentError(null)
  }

  const clearPendingFiles = () => {
    for (const { previewUrl } of pendingFiles) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        pendingPreviewUrlsRef.current.delete(previewUrl)
      }
    }
    setPendingFiles([])
  }

  const sendMessage = async (message: string) => {
    if (!userId || sending || responseLoading || !message.trim()) return
    const isEditing = editingMessageId !== null
    const editedIndex = isEditing ? convo.findIndex((entry) => entry.id === editingMessageId) : -1
    if (isEditing && (editedIndex < 0 || convo[editedIndex].role !== 'user')) {
      setRequestError('That message can no longer be edited.')
      setEditingMessageId(null)
      setEditingAttachments([])
      return
    }

    const previousMessages = isEditing ? convo.slice(0, editedIndex) : convo
    const replacedMessageIds = isEditing ? convo.slice(editedIndex).map((entry) => entry.id) : []
    const reusedAttachments = isEditing ? editingAttachments : []
    const currentFiles = pendingFiles.map(({ file }) => file)
    if (currentFiles.length + reusedAttachments.length > ASSISTANT_ATTACHMENT_MAX_COUNT
      || currentFiles.reduce((total, file) => total + file.size, 0)
        + reusedAttachments.reduce((total, attachment) => total + attachment.size, 0)
        > ASSISTANT_ATTACHMENT_MAX_TOTAL_SIZE) {
      setAttachmentError('Attachments in a message cannot exceed 3 files or 10 MB in total.')
      return
    }

    setSending(true)
    let conversationId: string
    try {
      if (activeConversationId) {
        conversationId = activeConversationId
      } else {
        const conversation = await createAssistantConversation(userId)
        conversationId = conversation.id
        knownEmptyConversationsRef.current.add(conversationId)
        localStorage.setItem(emptyConversationStorageKey(userId, conversationId), 'true')
        activeConversationRef.current = conversationId
        setActiveConversationId(conversationId)
      }
    } catch (error) {
      console.error('Unable to prepare a new Mr Groff conversation:', error)
      setRequestError(error instanceof Error ? error.message : 'Unable to start a new chat.')
      setSending(false)
      return
    }

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()
    const userMessage: AiChat = {
      id: userMessageId,
      role: 'user',
      message: message.trim(),
      attachments: reusedAttachments,
      createdAt: new Date().toISOString(),
    }
    const assistantMessage: AiChat = {
      id: assistantMessageId,
      role: 'assistant',
      message: '',
      createdAt: new Date().toISOString(),
    }
    const visibleMessages = [...previousMessages, userMessage, assistantMessage].slice(-100)
    convoRef.current = visibleMessages
    setConvo(visibleMessages)
    setRequestError(null)
    setAttachmentError(null)
    failedRequest.current = null
    setEditingMessageId(null)
    setEditingAttachments([])
    setResponseLoading(false)

    try {
      const reusedData = await Promise.all(reusedAttachments.map(async (attachment) => ({
        name: attachment.name,
        mime_type: attachment.mimeType,
        data: await readAssistantAttachment(attachment),
      })))
      const uploaded = await uploadAssistantAttachments(userId, conversationId, currentFiles)
      const attachments = [...reusedAttachments, ...uploaded.map(({ attachment }) => attachment)]
      const attachmentData = [
        ...reusedData,
        ...uploaded.map(({ attachment, data }) => ({
          name: attachment.name,
          mime_type: attachment.mimeType,
          data,
        })),
      ]
      const persistedUserMessage = { ...userMessage, attachments }
      const withAttachments = [...previousMessages, persistedUserMessage, assistantMessage].slice(-100)
      convoRef.current = withAttachments
      setConvo(withAttachments)
      await saveAssistantMessage(userId, conversationId, {
        id: userMessageId,
        role: 'user',
        content: message.trim(),
        attachments,
      })
      knownEmptyConversationsRef.current.delete(conversationId)
      localStorage.removeItem(emptyConversationStorageKey(userId, conversationId))
      if (replacedMessageIds.length) {
        await deleteAssistantMessages(
          userId,
          conversationId,
          replacedMessageIds,
          reusedAttachments.map((attachment) => attachment.storagePath),
        )
      }
      clearPendingFiles()
      try {
        const items = await loadAssistantConversations(userId)
        setConversations(await loadAssistantConversationsWithMessages(userId, items))
      } catch (error) {
        console.error('Unable to refresh Mr Groff conversation titles:', error)
        setHistoryError(getAssistantErrorMessage(error, 'Unable to refresh conversation history.'))
      }
      setSending(false)
      await aiResponse(
        message.trim(),
        previousMessages,
        userId,
        conversationId,
        userMessageId,
        assistantMessageId,
        attachments,
        attachmentData,
      )
    } catch (error) {
      console.error('Unable to send a Mr Groff message:', error)
      if (activeConversationRef.current === conversationId) {
        setRequestError(error instanceof Error ? error.message : 'Unable to send this message.')
        let restored = previousMessages
        let persistedUserMessage: AiChat | undefined
        try {
          const persisted = await loadAssistantMessages(userId, conversationId)
          const persistedUserRecord = persisted.find((entry) => entry.id === userMessageId)
          persistedUserMessage = persistedUserRecord
            ? {
              ...persistedUserRecord,
              proposals: parseProposals(persistedUserRecord.proposals),
            }
            : undefined
          if (persistedUserMessage) {
            restored = [
              ...previousMessages,
              persistedUserMessage,
              assistantMessage,
            ].slice(-100)
          } else if (isEditing) {
            restored = persisted.map((entry) => ({
              ...entry,
              proposals: parseProposals(entry.proposals),
            }))
          }
        } catch (loadError) {
          console.error('Unable to restore the Mr Groff conversation after a send error:', loadError)
        }
        convoRef.current = restored
        setConvo(restored)
        if (persistedUserMessage) {
          setPrompt('')
          clearPendingFiles()
          setEditingMessageId(null)
          setEditingAttachments([])
          if (replacedMessageIds.length) {
            try {
              await deleteAssistantMessages(
                userId,
                conversationId,
                replacedMessageIds,
                (persistedUserMessage.attachments ?? []).map((attachment) => attachment.storagePath),
              )
            } catch (cleanupError) {
              console.error('Unable to finish replacing the edited Mr Groff messages:', cleanupError)
              setHistoryError(cleanupError instanceof Error ? cleanupError.message : 'Unable to clean up replaced messages.')
            }
          }
          try {
            const attachmentData = await Promise.all((persistedUserMessage.attachments ?? []).map(async (attachment) => ({
              name: attachment.name,
              mime_type: attachment.mimeType,
              data: await readAssistantAttachment(attachment),
            })))
            setSending(false)
            await aiResponse(
              message.trim(),
              previousMessages,
              userId,
              conversationId,
              userMessageId,
              assistantMessageId,
              persistedUserMessage.attachments ?? [],
              attachmentData,
            )
          } catch (recoveryError) {
            console.error('Unable to resume the saved Mr Groff message:', recoveryError)
            setRequestError(recoveryError instanceof Error ? recoveryError.message : 'Unable to continue the saved message.')
          }
        } else {
          setPrompt(message.trim())
          if (isEditing) {
            setEditingMessageId(editingMessageId)
            setEditingAttachments(reusedAttachments)
          }
        }
        setResponseLoading(false)
      }
    } finally {
      setSending(false)
      if (!requestController.current) setResponseLoading(false)
    }
  }

  const handlePrompt = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = prompt.trim()
    if (!message || messagesLoading || sending || responseLoading || !userId) return
    setPrompt('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    void sendMessage(message)
  }

  const retryLastRequest = () => {
    const retry = failedRequest.current
    if (!retry || responseLoading || sending || useAppStore.getState().user?.id !== retry.userId
      || activeConversationRef.current !== retry.conversationId) return
    setRequestError(null)
    const existing = convoRef.current.some((entry) => entry.id === retry.assistantMessageId)
    const updated = existing
      ? convoRef.current.map((entry) => entry.id === retry.assistantMessageId
        ? { ...entry, message: '', proposals: undefined }
        : entry)
      : [...convoRef.current, { id: retry.assistantMessageId, role: 'assistant' as const, message: '' }]
    convoRef.current = updated
    setConvo(updated)
    void aiResponse(
      retry.userMessage,
      retry.previousMessages,
      retry.userId,
      retry.conversationId,
      retry.userMessageId,
      retry.assistantMessageId,
      retry.attachments,
      retry.attachmentData,
    )
  }

  const stopResponse = () => requestController.current?.abort()

  const editMessage = (message: AiChat) => {
    if (responseLoading || sending || message.role !== 'user') return
    setEditingMessageId(message.id)
    setEditingAttachments(message.attachments ?? [])
    setPendingFiles([])
    setPrompt(message.message)
    setRequestError(null)
    textareaRef.current?.focus()
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditingAttachments([])
    setPrompt('')
    setPendingFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const regenerateResponse = async (assistantMessageId: string) => {
    if (!userId || !activeConversationId || responseLoading || sending) return
    const assistantIndex = convo.findIndex((message) => message.id === assistantMessageId)
    const userIndex = assistantIndex - 1
    const userMessage = convo[userIndex]
    if (assistantIndex < 0 || !userMessage || userMessage.role !== 'user') return
    const conversationId = activeConversationId
    const previousMessages = convo.slice(0, userIndex)
    try {
      const attachmentData = await Promise.all((userMessage.attachments ?? []).map(async (attachment) => ({
        name: attachment.name,
        mime_type: attachment.mimeType,
        data: await readAssistantAttachment(attachment),
      })))
      await deleteAssistantMessages(
        userId,
        conversationId,
        convo.slice(assistantIndex).map((message) => message.id),
      )
      const assistantId = crypto.randomUUID()
      const nextMessages = [
        ...convo.slice(0, assistantIndex),
        { id: assistantId, role: 'assistant' as const, message: '' },
      ]
      convoRef.current = nextMessages
      setConvo(nextMessages)
      await aiResponse(
        userMessage.message,
        previousMessages,
        userId,
        conversationId,
        userMessage.id,
        assistantId,
        userMessage.attachments ?? [],
        attachmentData,
      )
    } catch (error) {
      console.error('Unable to regenerate a Mr Groff response:', error)
      setRequestError(error instanceof Error ? error.message : 'Unable to regenerate this response.')
    }
  }

  const copyMessage = async (message: AiChat) => {
    try {
      await navigator.clipboard.writeText(message.message)
      setCopiedMessageId(message.id)
      window.setTimeout(() => setCopiedMessageId((current) => current === message.id ? null : current), 1600)
    } catch (error) {
      console.error('Unable to copy a Mr Groff message:', error)
      setRequestError('Could not copy this message to the clipboard.')
    }
  }

  useEffect(() => {
    setBreadcrumb("Assistant")
  }, [setBreadcrumb])

  return (
    <section className="skald-assistant-page">
      <aside
        id="assistant-conversation-history"
        ref={historyMenuRef}
        role="dialog"
        aria-label="Conversation history"
        className={`skald-assistant-history ${historyOpen ? 'skald-assistant-history--open' : ''}`}
        aria-hidden={!historyOpen}
      >
        <div className="skald-assistant-history__heading">
          <div>
            <h2>Chats</h2>
          </div>
          <button
            type="button"
            className="skald-assistant-history__close"
            aria-label="Close conversation history"
            onClick={() => setHistoryOpen(false)}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <label className="skald-assistant-history__search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={historySearch}
            onChange={(event) => setHistorySearch(event.currentTarget.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
          />
        </label>
        {historyError && (
          <p role="alert" className="skald-assistant-history__error">{historyError}</p>
        )}
        {historyLoading ? (
          <LoadingIndicator label="Loading chats…" className="skald-loading-indicator--history" />
        ) : visibleConversations.length ? (
          <nav className="skald-assistant-history__list" aria-label="Conversation history">
            {visibleConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`skald-assistant-history__item ${conversation.id === activeConversationId ? 'is-active' : ''}`}
              >
                {renamingConversationId === conversation.id ? (
                  <form
                    className="skald-assistant-history__rename"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void saveConversationTitle(conversation.id)
                    }}
                  >
                    <input
                      autoFocus
                      maxLength={72}
                      value={renameDraft}
                      aria-label="Conversation title"
                      onChange={(event) => setRenameDraft(event.currentTarget.value)}
                    />
                    <button type="submit" aria-label="Save title"><Check size={14} /></button>
                    <button
                      type="button"
                      aria-label="Cancel renaming"
                      onClick={() => setRenamingConversationId(null)}
                    >
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="skald-assistant-history__select"
                      disabled={sending}
                      aria-current={conversation.id === activeConversationId ? 'page' : undefined}
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <span>{conversation.title}</span>
                      <small>{new Date(conversation.updatedAt).toLocaleDateString()}</small>
                    </button>
                    <div className="skald-assistant-history__actions">
                      <button
                        type="button"
                        disabled={sending || responseLoading}
                        aria-label={`Rename ${conversation.title}`}
                        onClick={() => {
                          setRenamingConversationId(conversation.id)
                          setRenameDraft(conversation.title)
                        }}
                      >
                        <Pencil size={13} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={sending || responseLoading}
                        aria-label={`Delete ${conversation.title}`}
                        onClick={() => setDeleteConversationId(conversation.id)}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
        ) : (
          <p className="skald-assistant-history__empty">
            {historySearch ? 'No conversations match your search.' : 'Your conversations will appear here.'}
          </p>
        )}
      </aside>

      <div className="skald-assistant-main">
        <header className="skald-assistant-header">
          <div className="skald-assistant-chat-picker" ref={historyPickerRef}>
            <button
              ref={historyTriggerRef}
              type="button"
              className="skald-assistant-chat-picker__trigger"
              aria-label="Choose a conversation"
              aria-controls="assistant-conversation-history"
              aria-expanded={historyOpen}
              aria-haspopup="dialog"
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <span>Chats and tasks</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="skald-assistant-new-chat"
              disabled={!userId || sending || responseLoading || creatingConversation}
              aria-label="New chat"
              title="New chat"
              onClick={() => void createConversation()}
            >
              <span className="skald-add-action__icon">
                {creatingConversation
                  ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  : <Plus size={16} aria-hidden="true" />}
              </span>
              <span>{creatingConversation ? 'Creating…' : 'New chat'}</span>
            </button>
          </div>
        </header>

      <div className={`skald-assistant-chat-area ${isInitialChat ? 'skald-assistant-chat-area--initial' : ''}`}>
        {historyError && (
          <div className="skald-assistant-load-error" role="alert">
            <div>
              {historyLoadFailed && <strong>Unable to load your chats.</strong>}
              {historyError !== 'Unable to load chat history.' && <p>{historyError}</p>}
            </div>
            {historyLoadFailed
              ? (
                <button
                  type="button"
                  onClick={() => {
                    setHistoryError(null)
                    setHistoryLoadFailed(false)
                    setHistoryLoading(true)
                    setHistoryReloadToken((token) => token + 1)
                  }}
                >
                  Retry loading chats
                </button>
              )
              : (
                <button type="button" onClick={() => setHistoryError(null)}>Dismiss</button>
              )}
          </div>
        )}
        {messagesError && activeConversationId && (
          <div className="skald-assistant-load-error" role="alert">
            <div>
              <strong>Unable to load this conversation.</strong>
              {messagesError !== 'Unable to load this conversation.' && <p>{messagesError}</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setMessagesError(null)
                setMessagesLoading(true)
                setMessagesReloadToken((token) => token + 1)
              }}
            >
              Retry loading messages
            </button>
          </div>
        )}
        {contextError && (
          <div role="status" className={`mx-4 mt-3 rounded-lg border px-3 py-2 text-xs sm:mx-6 ${
            isDark ? 'border-amber-300/20 bg-amber-300/5 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}>
            I can still chat, but couldn’t load all your task and note context. Action proposals will be checked before applying.
          </div>
        )}

        <div className="skald-assistant-conversation">
          <div className="skald-assistant-messages">
          {isInitialChat && (
            <div className="skald-assistant-initial">
              <div className="skald-assistant-initial__greeting">
                <h2>Hail, traveler.</h2>
                <p>I'm here to guide your thoughts.</p>
              </div>
              <div className="skald-assistant-initial__suggestions">
                {['Help me plan today', 'What should I prioritize?', 'Capture a task'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setPrompt(suggestion)
                      textareaRef.current?.focus()
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isLoadingConversation ? (
            <LoadingIndicator label="Opening conversation…" className="skald-loading-indicator--conversation" />
          ) : messagesToShow.map(c => (
            c.role === 'assistant'
              ? (
                <div
                  key={c.id}
                  className="skald-assistant-message mb-6 w-full ai-text"
                >
                  <div className="skald-assistant-message-copy min-w-0 pt-1 text-sm leading-7 [&_a]:text-indigo-400 [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2">
                    <ReactMarkdown>
                      {c.message}
                    </ReactMarkdown>
                    {c.message && (
                      <div className="skald-assistant-message-actions">
                        <button
                          type="button"
                          aria-label={copiedMessageId === c.id ? 'Copied' : 'Copy response'}
                          title={copiedMessageId === c.id ? 'Copied' : 'Copy response'}
                          onClick={() => void copyMessage(c)}
                        >
                          {copiedMessageId === c.id
                            ? <Check size={15} aria-hidden="true" />
                            : <Clipboard size={15} aria-hidden="true" />}
                        </button>
                        <button
                          type="button"
                          aria-label="Regenerate response"
                          title="Regenerate response"
                          disabled={responseLoading || sending}
                          onClick={() => void regenerateResponse(c.id)}
                        >
                          <RotateCcw size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    {c.proposals?.map((proposal) => (
                      <section
                        key={proposal.id}
                        className="skald-assistant-proposal mt-4 rounded-xl border p-4"
                      >
                        <p className="font-medium">{proposal.action.summary}</p>
                        <p className="skald-assistant-proposal__kind mt-1 text-xs">
                          {proposal.action.action.replaceAll('_', ' ')}
                        </p>
                        <pre className="skald-assistant-proposal__details mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md p-2 text-sm">
                          {getProposalDetails(proposal.action, tasks, notes, taskLists)}
                        </pre>
                        {contextError && (
                          <p role="alert" className="mt-2 text-sm text-red-400">
                            Unable to verify the current record before applying: {contextError.message}
                          </p>
                        )}
                        {proposal.status === 'pending' && (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              disabled={proposal.status !== 'pending'}
                              className="skald-assistant-confirm rounded-md px-3 py-1 text-sm"
                              onClick={() => void applyProposal(c.id, proposal)}
                            >
                              {proposal.action.action.startsWith('delete_') ? 'Confirm delete' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              disabled={contextLoading || Boolean(contextError)}
                              className="rounded-md border border-current/20 px-3 py-1 text-sm opacity-75 hover:opacity-100"
                              onClick={() => void updateProposal(c.id, proposal.id, { status: 'dismissed' })}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                        {proposal.status === 'applying' && <p className="mt-3 text-sm">Applying…</p>}
                        {proposal.status === 'applied' && <p className="mt-3 text-sm text-green-500">Applied</p>}
                        {proposal.status === 'dismissed' && <p className="mt-3 text-sm opacity-60">Dismissed</p>}
                        {proposal.status === 'failed' && <p role="alert" className="mt-3 text-sm text-red-400">{proposal.error}</p>}
                      </section>
                    ))}
                  </div>
                </div>
              )
              : (
                <div
                  key={c.id}
                  className="skald-assistant-message skald-assistant-message--user my-4 flex w-full justify-end"
                >
                  <div className="max-w-[85%] sm:max-w-[75%]">
                    <div className="skald-assistant-user-bubble whitespace-pre-wrap break-words rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-6">
                      {c.message}
                      {c.attachments?.length ? (
                        <div className="mt-2 grid gap-2">
                          {c.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              className="skald-assistant-attachment"
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              download={attachment.name}
                            >
                              {attachment.mimeType.startsWith('image/') && attachment.url
                                ? <img src={attachment.url} alt={attachment.name} loading="lazy" />
                                : <FileText size={17} aria-hidden="true" />}
                              <span>{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="skald-assistant-message-actions skald-assistant-message-actions--user">
                      {formatMessageTime(c.createdAt) && (
                        <time dateTime={c.createdAt}>{formatMessageTime(c.createdAt)}</time>
                      )}
                      <button
                        type="button"
                        aria-label={copiedMessageId === c.id ? 'Copied' : 'Copy message'}
                        title={copiedMessageId === c.id ? 'Copied' : 'Copy message'}
                        onClick={() => void copyMessage(c)}
                      >
                        {copiedMessageId === c.id
                          ? <Check size={15} aria-hidden="true" />
                          : <Clipboard size={15} aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Edit message"
                        title="Edit message"
                        disabled={responseLoading || sending}
                        onClick={() => editMessage(c)}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              )
          ))}

          {responseLoading && (
            <div className="mt-1 flex min-h-8 items-center gap-2">
              <Pulsar size="26" speed="2.4" color={isDark ? "white" : "#602bf8"} />
              <span className={`text-xs ${isDark ? 'text-white/45' : 'text-slate-500'}`}>Mr Groff is thinking…</span>
            </div>
          )}
          {sending && (
            <div className="mt-1 flex min-h-8 items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              <span className={`text-xs ${isDark ? 'text-white/45' : 'text-slate-500'}`}>Preparing your message…</span>
            </div>
          )}
          <div ref={conversationEndRef} />
          </div>
        </div>

      <form
        onSubmit={handlePrompt}
        className="skald-assistant-composer"
      >
        {editingMessageId && (
          <div className="skald-assistant-edit-banner">
            <span>Editing your message</span>
            <button type="button" onClick={cancelEdit} aria-label="Cancel editing">
              <X size={14} aria-hidden="true" />
              Cancel
            </button>
          </div>
        )}
        {requestError && (
          <div role="alert" className={`mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
            isDark ? 'border-rose-300/20 bg-rose-500/10 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}>
            <span className="flex min-w-0 items-start gap-2">
              <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{requestError}</span>
            </span>
            {failedRequest.current && (
              <button
                type="button"
                onClick={retryLastRequest}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-black/5"
              >
                <RotateCcw size={14} aria-hidden="true" />
                Retry
              </button>
            )}
          </div>
        )}
        {attachmentError && (
          <p role="alert" className="mb-2 text-xs text-rose-500">{attachmentError}</p>
        )}
        {(editingAttachments.length > 0 || pendingFiles.length > 0) && (
          <div className="skald-assistant-pending-files">
            {editingAttachments.map((attachment) => (
              <span className="skald-assistant-pending-file" key={attachment.id}>
                <FileText size={14} aria-hidden="true" />
                {attachment.name}
                <button
                  type="button"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => setEditingAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </span>
            ))}
            {pendingFiles.map((attachment, index) => (
              <span className="skald-assistant-pending-file" key={`${attachment.file.name}-${index}`}>
                {attachment.previewUrl
                  ? <img src={attachment.previewUrl} alt="" />
                  : <FileText size={14} aria-hidden="true" />}
                {attachment.file.name}
                <button
                  type="button"
                  aria-label={`Remove ${attachment.file.name}`}
                  onClick={() => removePendingFile(index)}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/markdown,text/csv,.md,.markdown,.csv"
          multiple
          onChange={(event) => {
            if (event.currentTarget.files) addPendingFiles(event.currentTarget.files)
            event.currentTarget.value = ''
          }}
        />
        <div className="skald-assistant-composer__row">
          <button
            type="button"
            className="skald-assistant-icon-button skald-assistant-attach"
            disabled={!userId || isLoadingConversation || historyLoadFailed || sending || responseLoading || pendingFiles.length + editingAttachments.length >= ASSISTANT_ATTACHMENT_MAX_COUNT}
            aria-label="Attach files"
            title="Attach images, PDFs, or text files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={19} aria-hidden="true" />
          </button>
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            className="skald-assistant-composer__input"
            placeholder="Message Mr Groff…"
            aria-label="Message Mr Groff"
            rows={1}
            maxLength={4000}
            onChange={(event) => {
              setPrompt(event.currentTarget.value)
              if (requestError) setRequestError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            value={prompt}
          />
          <button
            className={`skald-assistant-send ${responseLoading ? 'is-stop' : ''}`}
            type={responseLoading ? 'button' : 'submit'}
            onClick={responseLoading ? stopResponse : undefined}
            disabled={!responseLoading && (isLoadingConversation || historyLoadFailed || sending || !prompt.trim())}
            aria-label={responseLoading ? 'Stop response' : 'Send message'}
            title={responseLoading ? 'Stop response' : 'Send message'}
          >
            {responseLoading
              ? <Square size={14} fill="currentColor" aria-hidden="true" />
              : <Send size={16} aria-hidden="true" />}
          </button>
        </div>
      </form>
      </div>
      </div>
      {deleteConversationId && (
        <div className="skald-assistant-dialog-backdrop" role="presentation">
          <div
            className="skald-assistant-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-assistant-chat-title"
          >
            <h2 id="delete-assistant-chat-title">Delete this conversation?</h2>
            <p>This permanently deletes its messages and attachments.</p>
            <div>
              <button type="button" onClick={() => setDeleteConversationId(null)}>Cancel</button>
              <button type="button" className="is-danger" onClick={() => void confirmDeleteConversation()}>
                Delete conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Assistant
