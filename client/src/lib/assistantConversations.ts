import { supabase } from '@/lib/supabase'

export const ASSISTANT_ATTACHMENT_BUCKET = 'assistant-attachments'
export const ASSISTANT_ATTACHMENT_MAX_FILE_SIZE = 5 * 1024 * 1024
export const ASSISTANT_ATTACHMENT_MAX_TOTAL_SIZE = 10 * 1024 * 1024
export const ASSISTANT_ATTACHMENT_MAX_COUNT = 3

const MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
])

const EXTENSION_MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  markdown: 'text/markdown',
  md: 'text/markdown',
  pdf: 'application/pdf',
  png: 'image/png',
  txt: 'text/plain',
  webp: 'image/webp',
}

export type AssistantConversation = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export type StoredAssistantAttachment = {
  id: string
  name: string
  mimeType: string
  size: number
  storagePath: string
  url?: string
}

export type AssistantMessageRow = {
  id: string
  role: 'user' | 'assistant'
  message: string
  attachments: StoredAssistantAttachment[]
  proposals: unknown[]
  createdAt: string
}

export type UploadedAssistantAttachment = {
  attachment: StoredAssistantAttachment
  data: string
}

type ConversationRecord = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

const toConversation = (record: ConversationRecord): AssistantConversation => ({
  id: record.id,
  title: record.title,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

const toBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

const attachmentMimeType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mimeType = file.type || EXTENSION_MIME_TYPES[extension] || ''
  if (!MIME_TYPES.has(mimeType)) {
    throw new Error(`${file.name}: attach a PNG, JPEG, WebP, PDF, TXT, Markdown, or CSV file.`)
  }
  return mimeType
}

const validateFileContents = async (file: File, mimeType: string): Promise<void> => {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const startsWith = (...signature: number[]) =>
    signature.every((value, index) => bytes[index] === value)

  if (mimeType === 'image/png' && !startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    throw new Error(`${file.name} does not contain a valid PNG image.`)
  }
  if (mimeType === 'image/jpeg' && !startsWith(0xff, 0xd8, 0xff)) {
    throw new Error(`${file.name} does not contain a valid JPEG image.`)
  }
  if (mimeType === 'image/webp'
    && (String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF'
      || String.fromCharCode(...bytes.slice(8, 12)) !== 'WEBP')) {
    throw new Error(`${file.name} does not contain a valid WebP image.`)
  }
  if (mimeType === 'application/pdf' && new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    throw new Error(`${file.name} does not contain a valid PDF document.`)
  }
  if (mimeType.startsWith('text/')) {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
    } catch (error) {
      throw new Error(`${file.name} must be a UTF-8 text file.`, { cause: error })
    }
  }
}

export const loadAssistantConversations = async (userId: string): Promise<AssistantConversation[]> => {
  const { data, error } = await supabase
    .from('assistant_conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return (data ?? []).map((record) => toConversation(record as ConversationRecord))
}

export const loadAssistantConversationsWithMessages = async (
  userId: string,
  conversations: AssistantConversation[],
): Promise<AssistantConversation[]> => {
  if (!conversations.length) return []

  const conversationIds = conversations.map(({ id }) => id)
  const conversationsWithUserMessages = new Set<string>()
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('assistant_messages')
      .select('conversation_id')
      .eq('user_id', userId)
      .eq('role', 'user')
      .in('conversation_id', conversationIds)
      .order('conversation_id')
      .order('id')
      .range(offset, offset + pageSize - 1)

    if (error) throw error
    for (const row of data ?? []) conversationsWithUserMessages.add(row.conversation_id)
    if ((data ?? []).length < pageSize) break
  }

  return conversations.filter(({ id }) => conversationsWithUserMessages.has(id))
}

export const searchAssistantConversations = async (
  userId: string,
  query: string,
): Promise<AssistantConversation[]> => {
  const search = query.trim()
  if (!search) {
    const conversations = await loadAssistantConversations(userId)
    return loadAssistantConversationsWithMessages(userId, conversations)
  }

  const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const [titleResult, messageResult] = await Promise.all([
    supabase
      .from('assistant_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .ilike('title', pattern)
      .limit(100),
    supabase
      .from('assistant_messages')
      .select('conversation_id')
      .eq('user_id', userId)
      .ilike('content', pattern)
      .limit(500),
  ])
  if (titleResult.error) throw titleResult.error
  if (messageResult.error) throw messageResult.error

  const ids = [...new Set((messageResult.data ?? []).map((row) => row.conversation_id))]
  const messageMatches = ids.length
    ? await supabase
      .from('assistant_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .in('id', ids)
    : { data: [], error: null }
  if (messageMatches.error) throw messageMatches.error

  const records = new Map<string, ConversationRecord>()
  for (const record of [...(titleResult.data ?? []), ...(messageMatches.data ?? [])]) {
    const conversation = record as ConversationRecord
    records.set(conversation.id, conversation)
  }
  const matches = [...records.values()]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .map(toConversation)
  return loadAssistantConversationsWithMessages(userId, matches)
}

export const createAssistantConversation = async (
  userId: string,
  title = 'New chat',
): Promise<AssistantConversation> => {
  const { data, error } = await supabase
    .from('assistant_conversations')
    .insert({ user_id: userId, title })
    .select('id, title, created_at, updated_at')
    .single()

  if (error) throw error
  return toConversation(data as ConversationRecord)
}

export const renameAssistantConversation = async (
  userId: string,
  conversationId: string,
  title: string,
): Promise<void> => {
  const { error } = await supabase
    .from('assistant_conversations')
    .update({ title })
    .eq('id', conversationId)
    .eq('user_id', userId)
  if (error) throw error
}

export const deleteAssistantConversation = async (
  userId: string,
  conversationId: string,
): Promise<void> => {
  const { data, error: messagesError } = await supabase
    .from('assistant_messages')
    .select('attachments')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
  if (messagesError) throw messagesError

  const paths = (data ?? []).flatMap((row) => {
    if (!Array.isArray(row.attachments)) return []
    return row.attachments.flatMap((item) => {
      if (typeof item !== 'object' || item === null || !('storagePath' in item)) return []
      const path = item.storagePath
      return typeof path === 'string' ? [path] : []
    })
  })

  if (paths.length) {
    const { error } = await supabase.storage.from(ASSISTANT_ATTACHMENT_BUCKET).remove([...new Set(paths)])
    if (error) throw error
  }

  const { error } = await supabase
    .from('assistant_conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)
  if (error) throw error
}

export const loadAssistantMessages = async (
  userId: string,
  conversationId: string,
): Promise<AssistantMessageRow[]> => {
  const { data, error } = await supabase
    .from('assistant_messages')
    .select('id, role, content, attachments, proposals, created_at')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) throw error
  return Promise.all((data ?? []).map(async (record) => {
    const attachments = Array.isArray(record.attachments)
      ? await Promise.all(record.attachments.map(async (value) => {
        if (typeof value !== 'object' || value === null) {
          throw new Error('A saved chat attachment has invalid metadata.')
        }
        const attachment = value as Omit<StoredAssistantAttachment, 'url'>
        if (typeof attachment.storagePath !== 'string'
          || typeof attachment.name !== 'string'
          || typeof attachment.mimeType !== 'string'
          || typeof attachment.size !== 'number'
          || typeof attachment.id !== 'string') {
          throw new Error('A saved chat attachment has invalid metadata.')
        }
        const { data: signed, error: signedError } = await supabase.storage
          .from(ASSISTANT_ATTACHMENT_BUCKET)
          .createSignedUrl(attachment.storagePath, 60 * 60)
        if (signedError) throw signedError
        return { ...attachment, url: signed.signedUrl }
      }))
      : []
    return {
      id: record.id,
      role: record.role as 'user' | 'assistant',
      message: record.content,
      attachments,
      proposals: Array.isArray(record.proposals) ? record.proposals : [],
      createdAt: record.created_at,
    }
  }))
}

export const saveAssistantMessage = async (
  userId: string,
  conversationId: string,
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    attachments?: StoredAssistantAttachment[]
    proposals?: unknown[]
  },
): Promise<void> => {
  const { error } = await supabase
    .from('assistant_messages')
    .insert({
      id: message.id,
      user_id: userId,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      attachments: (message.attachments ?? []).map(({ id, name, mimeType, size, storagePath }) => ({
        id,
        name,
        mimeType,
        size,
        storagePath,
      })),
      proposals: message.proposals ?? [],
    })
  if (error) throw error

  const title = message.role === 'user' ? message.content.trim().replace(/\s+/g, ' ').slice(0, 72) : ''
  if (title) {
    const { error: titleError } = await supabase
      .from('assistant_conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .eq('title', 'New chat')
    if (titleError) throw titleError
  }
}

export const saveAssistantProposals = async (
  userId: string,
  conversationId: string,
  messageId: string,
  proposals: unknown[],
): Promise<void> => {
  const { error } = await supabase
    .from('assistant_messages')
    .update({ proposals })
    .eq('id', messageId)
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
  if (error) throw error
}

export const deleteAssistantMessages = async (
  userId: string,
  conversationId: string,
  messageIds: string[],
  preserveStoragePaths: string[] = [],
): Promise<void> => {
  const ids = [...new Set(messageIds)]
  if (!ids.length) return

  const { data, error: messagesError } = await supabase
    .from('assistant_messages')
    .select('id, attachments')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .in('id', ids)
  if (messagesError) throw messagesError

  const paths = (data ?? []).flatMap((row) =>
    Array.isArray(row.attachments)
      ? row.attachments.flatMap((item) => {
        if (typeof item !== 'object' || item === null || !('storagePath' in item)) return []
        return typeof item.storagePath === 'string' ? [item.storagePath] : []
      })
      : [])
  const { error } = await supabase
    .from('assistant_messages')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .in('id', ids)
  if (error) throw error

  const preservedPaths = new Set(preserveStoragePaths)
  const removablePaths = [...new Set(paths)].filter((path) => !preservedPaths.has(path))
  if (removablePaths.length) {
    const { error: storageError } = await supabase.storage
      .from(ASSISTANT_ATTACHMENT_BUCKET)
      .remove(removablePaths)
    if (storageError) throw storageError
  }
}

export const uploadAssistantAttachments = async (
  userId: string,
  conversationId: string,
  files: File[],
): Promise<UploadedAssistantAttachment[]> => {
  if (files.length > ASSISTANT_ATTACHMENT_MAX_COUNT) {
    throw new Error(`Attach up to ${ASSISTANT_ATTACHMENT_MAX_COUNT} files per message.`)
  }
  if (files.reduce((total, file) => total + file.size, 0) > ASSISTANT_ATTACHMENT_MAX_TOTAL_SIZE) {
    throw new Error('Attachments in a message cannot exceed 10 MB in total.')
  }

  const accepted = await Promise.all(files.map(async (file) => {
    if (!file.size || file.size > ASSISTANT_ATTACHMENT_MAX_FILE_SIZE) {
      throw new Error(`${file.name} must be no larger than 5 MB.`)
    }
    const mimeType = attachmentMimeType(file)
    await validateFileContents(file, mimeType)
    return { file, mimeType, data: await toBase64(file) }
  }))

  const uploaded: UploadedAssistantAttachment[] = []
  try {
    for (const { file, mimeType, data } of accepted) {
      const id = crypto.randomUUID()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'attachment'
      const storagePath = `${userId}/${conversationId}/${id}-${safeName}`
      const { error } = await supabase.storage
        .from(ASSISTANT_ATTACHMENT_BUCKET)
        .upload(storagePath, file, { contentType: mimeType, upsert: false })
      if (error) throw error
      uploaded.push({
        attachment: { id, name: file.name, mimeType, size: file.size, storagePath },
        data,
      })

      const { data: signed, error: signedError } = await supabase.storage
        .from(ASSISTANT_ATTACHMENT_BUCKET)
        .createSignedUrl(storagePath, 60 * 60)
      if (signedError) throw signedError
      uploaded[uploaded.length - 1].attachment.url = signed.signedUrl
    }
  } catch (error) {
    const paths = uploaded.map(({ attachment }) => attachment.storagePath)
    if (paths.length) {
      const { error: cleanupError } = await supabase.storage.from(ASSISTANT_ATTACHMENT_BUCKET).remove(paths)
      if (cleanupError) console.error('Unable to clean up incomplete assistant attachment upload:', cleanupError)
    }
    throw error
  }
  return uploaded
}

export const readAssistantAttachment = async (
  attachment: StoredAssistantAttachment,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(ASSISTANT_ATTACHMENT_BUCKET)
    .download(attachment.storagePath)
  if (error) throw error
  if (data.size > ASSISTANT_ATTACHMENT_MAX_FILE_SIZE) {
    throw new Error(`${attachment.name} exceeds the 5 MB attachment limit.`)
  }
  return toBase64(data)
}
