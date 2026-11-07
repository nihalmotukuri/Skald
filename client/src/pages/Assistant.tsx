import React, { useEffect, useRef, useState } from "react"
import { useAppStore } from '@/store/appStore'
import { supabase } from '@/lib/supabase'
import { useTasks, useTaskLists, useTaskMutations } from '@/queries/tasks'
import { useNotes, useNoteMutations } from '@/queries/notes'
import type { Task } from '@/types/task'
import type { Note } from '@/types/note'
import { LuBot } from "react-icons/lu"
import { RiSendPlaneLine } from "react-icons/ri"
import ReactMarkdown from 'react-markdown'
import { Pulsar } from 'ldrs/react'
import 'ldrs/react/Pulsar.css'

type AiChat = {
  id: string,
  role: 'user' | 'assistant',
  message: string,
  proposals?: AssistantProposal[],
}

type TaskPriority = 'low' | 'medium' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'

type ProposedAction =
  | { action: 'create_task'; summary: string; title: string; description: string; due_at: string | null; priority: TaskPriority; status: TaskStatus; task_list_id: string | null }
  | { action: 'update_task'; summary: string; task_id: string; title: string; description: string; due_at: string | null; priority: TaskPriority; status: TaskStatus; task_list_id: string | null }
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseProposals = (value: unknown): AssistantProposal[] => {
  if (!Array.isArray(value)) return []
  return value.slice(0, 3).flatMap((item): AssistantProposal[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || !isRecord(item.action)) return []
    const action = item.action
    if (typeof action.summary !== 'string') return []
    const base = { id: item.id, summary: action.summary }
    switch (action.action) {
      case 'create_task':
        if (typeof action.title !== 'string' || typeof action.description !== 'string'
          || !['low', 'medium', 'high'].includes(String(action.priority))
          || !['pending', 'in_progress', 'done', 'cancelled'].includes(String(action.status))
          || !(action.due_at === null || typeof action.due_at === 'string')
          || !(action.task_list_id === null || typeof action.task_list_id === 'string')) return []
        return [{ ...base, action: action as ProposedAction, status: 'pending' }]
      case 'update_task':
        if (typeof action.task_id !== 'string' || typeof action.title !== 'string'
          || typeof action.description !== 'string'
          || !['low', 'medium', 'high'].includes(String(action.priority))
          || !['pending', 'in_progress', 'done', 'cancelled'].includes(String(action.status))
          || !(action.due_at === null || typeof action.due_at === 'string')
          || !(action.task_list_id === null || typeof action.task_list_id === 'string')) return []
        return [{ ...base, action: action as ProposedAction, status: 'pending' }]
      case 'delete_task':
        return typeof action.task_id === 'string'
          ? [{ ...base, action: action as ProposedAction, status: 'pending' }]
          : []
      case 'create_note':
        return typeof action.title === 'string' && typeof action.body === 'string'
          ? [{ ...base, action: action as ProposedAction, status: 'pending' }]
          : []
      case 'update_note':
        return typeof action.note_id === 'string' && typeof action.title === 'string'
          && typeof action.body === 'string'
          ? [{ ...base, action: action as ProposedAction, status: 'pending' }]
          : []
      case 'delete_note':
        return typeof action.note_id === 'string'
          ? [{ ...base, action: action as ProposedAction, status: 'pending' }]
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

const aiChat: AiChat[] = [
  {
    id: 'welcome',
    role: 'assistant',
    message: "Hail, traveler. I'm here to guide your thoughts."
  },
]

const loadConversation = (userId: string | undefined): AiChat[] => {
  if (!userId) return aiChat

  try {
    const storedConvo = localStorage.getItem(`skald_ai_chat:${userId}`)
    if (!storedConvo) return aiChat
    const parsedConvo: unknown = JSON.parse(storedConvo)
    if (!Array.isArray(parsedConvo)) return aiChat

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
    return messages.length ? messages.slice(-100) : aiChat
  } catch (error) {
    console.error('Unable to restore Mr Groff conversation:', error)
    return aiChat
  }
}

const Assistant = () => {
  const [conversation, setConversation] = useState(() => ({
    userId: useAppStore.getState().user?.id,
    messages: loadConversation(useAppStore.getState().user?.id)
  }))
  const [prompt, setPrompt] = useState("")
  const [responseLoading, setResponseLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const applyingProposals = useRef(new Set<string>())
  const requestController = useRef<AbortController | null>(null)

  const user = useAppStore((state) => state.user)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const userId = user?.id
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
  const convo = conversation.userId === user?.id ? conversation.messages : aiChat

  useEffect(() => {
    if (!user?.id) return
    requestController.current?.abort()
    setConversation({ userId: user.id, messages: loadConversation(user.id) })
    setRequestError(null)
    setResponseLoading(false)
    return () => requestController.current?.abort()
  }, [user?.id])

  useEffect(() => {
    if (user?.id && conversation.userId === user.id) {
      localStorage.setItem(
        `skald_ai_chat:${user.id}`,
        JSON.stringify(conversation.messages.map(({ id, role, message }) => ({ id, role, message })))
      )
    }
  }, [conversation, user?.id])

  useEffect(() => {
    const textarea = textareaRef.current
    textarea?.focus()
  })

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  const aiResponse = async (
    userMessage: string,
    previousMessages: AiChat[],
    userId: string,
    assistantMessageId: string
  ) => {
    setResponseLoading(true)
    setRequestError(null)
    try {
      const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL?.replace(/\/+$/, '')
      if (!apiUrl) throw new Error('Mr Groff is not configured. Set VITE_ASSISTANT_API_URL for the web app.')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session || session.user.id !== userId) throw new Error('Your session expired. Sign in again to continue.')

      const messages = [
        ...previousMessages
          .filter((message) => message.id !== 'welcome')
          .slice(-19)
          .map(({ role, message, proposals }) => ({
            role,
            content: (proposals?.length
              ? `${message}\nProposed actions: ${proposals.map((proposal) => proposal.action.summary).join('; ')}`
              : message).slice(0, 4000)
          })),
        { role: 'user' as const, content: userMessage }
      ]
      const controller = new AbortController()
      requestController.current = controller
      const res = await fetch(`${apiUrl}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages }),
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
      let completed = false
      const handleEvent = (event: string) => {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')
        if (!data) return
        let payload: { type?: unknown; text?: unknown; reply?: unknown; proposals?: unknown; detail?: unknown }
        try {
          payload = JSON.parse(data)
        } catch {
          throw new Error('Mr Groff sent an invalid stream event.')
        }

        if (payload.type === 'delta' && typeof payload.text === 'string') {
          if (useAppStore.getState().user?.id === userId) {
            setConversation((current) => ({
              userId,
              messages: current.messages.map((message) => message.id === assistantMessageId
                ? { ...message, message: message.message + payload.text }
                : message)
            }))
          }
        } else if (payload.type === 'complete' && typeof payload.reply === 'string') {
          const proposals = parseProposals(payload.proposals)
          if (useAppStore.getState().user?.id === userId) {
            setConversation((current) => ({
              userId,
              messages: current.messages.map((message) => message.id === assistantMessageId
                ? {
                  ...message,
                  message: payload.reply as string,
                  ...(proposals.length ? { proposals } : {})
                }
                : message)
            }))
          }
          completed = true
        } else if (payload.type === 'error') {
          throw new Error(typeof payload.detail === 'string' ? payload.detail : 'Mr Groff could not complete that response.')
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() ?? ''
        for (const event of events) handleEvent(event)
        if (done) break
      }
      if (buffer.trim()) handleEvent(buffer)
      if (!completed) throw new Error('Mr Groff ended the response unexpectedly. Please try again.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Mr Groff request failed:', error)
      if (useAppStore.getState().user?.id === userId) {
        setRequestError(error instanceof Error ? error.message : 'Mr Groff could not respond. Please try again.')
        setConversation((current) => ({
          ...current,
          messages: current.messages.filter((message) => message.id !== assistantMessageId || message.message)
        }))
      }
    } finally {
      if (requestController.current?.signal.aborted !== true
        && useAppStore.getState().user?.id === userId) setResponseLoading(false)
    }
  }

  const updateProposal = (messageId: string, proposalId: string, update: Partial<AssistantProposal>) => {
    setConversation((current) => ({
      ...current,
      messages: current.messages.map((message) => message.id !== messageId
        ? message
        : {
          ...message,
          proposals: message.proposals?.map((proposal) => proposal.id === proposalId
            ? { ...proposal, ...update }
            : proposal)
        })
    }))
  }

  const applyProposal = async (messageId: string, proposal: AssistantProposal) => {
    const proposalKey = `${messageId}:${proposal.id}`
    if (proposal.status !== 'pending' || !userId || applyingProposals.current.has(proposalKey)) return
    applyingProposals.current.add(proposalKey)
    updateProposal(messageId, proposal.id, { status: 'applying', error: undefined })

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

      updateProposal(messageId, proposal.id, { status: 'applied' })
    } catch (error) {
      console.error('Unable to apply Mr Groff proposal:', error)
      updateProposal(messageId, proposal.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unable to apply this proposal.'
      })
    } finally {
      applyingProposals.current.delete(proposalKey)
    }
  }

  const handlePrompt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const message = prompt.trim()
    if (!message || responseLoading || !user?.id) return
    const previousMessages = convo
    const userMessage: AiChat = { id: crypto.randomUUID(), role: 'user', message }
    const assistantMessage: AiChat = { id: crypto.randomUUID(), role: 'assistant', message: '' }
    setConversation((current) => ({
      userId: user.id,
      messages: [
        ...(current.userId === user.id ? current.messages : previousMessages),
        userMessage,
        assistantMessage
      ].slice(-100)
    }))
    void aiResponse(message, previousMessages, user.id, assistantMessage.id)
    setPrompt('')
    if (textareaRef.current) textareaRef.current.style.height = "21px"
  }

  useEffect(() => {
    setBreadcrumb("Assistant")
  }, [setBreadcrumb])

  return (
    <div className={`relative col-span-1 row-span-1 grid grid-cols-[1fr] grid-rows-[1fr] ${isDark ? "bg-white/2 border-white/6" : "bg-white"} backdrop-blur-md border rounded-md shadow-xl p-[24px] overflow-y-auto mt-4`}>
      <div className="w-full overflow-y-auto col-span-1 row-span-1">
        <div className="pb-[100px]">
          {convo.map(c => (
            c.role === 'assistant'
              ? (
                <div
                  key={c.id}
                  className="w-full max-w-[720px] grid grid-cols-[52px_1fr] pl-[18px] ai-text"
                >
                  <LuBot className={`text-[22px] ${isDark ? "bg-white/8" : "bg-[#602bf8]"} text-white size-auto p-[8px] rounded-3xl`} />

                  <div className={`w-full pt-[6px] ${isDark ? "text-slate-200" : "text-blue-950"}`}>
                    <ReactMarkdown>
                      {c.message}
                    </ReactMarkdown>
                    {c.proposals?.map((proposal) => (
                      <section
                        key={proposal.id}
                        className={`mt-4 rounded-xl border p-4 ${isDark ? 'border-white/15 bg-white/5' : 'border-black/15 bg-black/5'}`}
                      >
                        <p className="font-medium">{proposal.action.summary}</p>
                        <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {proposal.action.action.replaceAll('_', ' ')}
                        </p>
                        <pre className={`mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md p-2 text-sm ${isDark ? 'bg-black/20 text-slate-300' : 'bg-white/70 text-slate-700'}`}>
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
                              className={`rounded-md px-3 py-1 text-sm ${isDark ? 'bg-white/15 hover:bg-white/25' : 'bg-black/10 hover:bg-black/15'}`}
                              onClick={() => void applyProposal(c.id, proposal)}
                            >
                              {proposal.action.action.startsWith('delete_') ? 'Confirm delete' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              disabled={contextLoading || Boolean(contextError)}
                              className="rounded-md border border-current/20 px-3 py-1 text-sm opacity-75 hover:opacity-100"
                              onClick={() => updateProposal(c.id, proposal.id, { status: 'dismissed' })}
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
                  className="ml-auto flex justify-end w-full max-w-[720px] pr-[18px] my-[16px]"
                >
                  <div
                    className={`${isDark ? "bg-white/5" : "bg-[#602bf8] text-white"} px-3 py-2 max-w-full`}
                    style={{
                      borderRadius: "16px",
                      borderBottomRightRadius: "0"
                    }}
                  >
                    <p className="w-full">
                      {c.message}
                    </p>
                  </div>
                </div>
              )
          ))}

          {
            responseLoading
              ? (
                <div className="ml-[22px] mt-2">
                  <Pulsar
                    size="30"
                    speed="2.4"
                    color={isDark ? "white" : "#602bf8"}
                  />
                </div>
              ) : null
          }
        </div>
      </div>

      <form
        onSubmit={handlePrompt}
        className={`absolute bottom-[24px] right-0 left-0 m-auto grid grid-rows-[1fr_32px] gap-[12px] w-full max-w-[690px] border ${isDark ? "bg-white/6 border-white/10" : "bg-white/10 border-black/30"} backdrop-blur-md rounded-2xl shadow-lg px-4 py-3`}
      >
        {requestError && <p role="alert" className="text-sm text-red-400">{requestError}</p>}
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          className={`${isDark ? "text-white" : "text-slate-800"} resize-none outline-none w-full bg-transparent  text-[14px]`}
          placeholder="Ask anything"
          rows={1}
          maxLength={4000}
          onChange={e => setPrompt(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          value={prompt}
        >
        </textarea>

        <button
          className={`text-[16px] ${ isDark ? "bg-white text-[#0f111a]" : "bg-[#602bf8] text-white"} size-auto p-[8px] rounded-2xl ml-auto cursor-pointer`}
          type="submit"
          disabled={responseLoading || !prompt.trim()}
          aria-label="Send message"
        >
          <RiSendPlaneLine />
        </button>
      </form>
    </div>
  )
}

export default Assistant
