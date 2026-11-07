import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Note, NoteImageAttachment } from '@/types/note'
import { supabase } from '@/lib/supabase'

interface NoteRow {
  id: string
  user_id: string
  title: string
  body: string
  image_path: string | null
  created_at: string
  updated_at: string
  is_pinned: boolean
  color: NonNullable<Note['color']>
  font_family: NonNullable<Note['fontFamily']>
  reminder_at: string | null
  archived_at: string | null
  image_attachments: { id: string; path: string; width: number }[] | null
}

export const noteKeys = {
  all: ['notes'] as const,
  list: (userId: string) => [...noteKeys.all, userId] as const
}

const toNote = async (row: NoteRow): Promise<Note> => {
  const [legacyImage, imageAttachments] = await Promise.all([
    row.image_path
      ? supabase.storage.from('note-images').createSignedUrl(row.image_path, 60 * 60)
      : Promise.resolve(null),
    Promise.all((row.image_attachments ?? []).map(async (attachment) => {
      const { data, error } = await supabase.storage
        .from('note-images')
        .createSignedUrl(attachment.path, 60 * 60)
      if (error) throw error
      return { ...attachment, url: data.signedUrl }
    })),
  ])
  if (legacyImage?.error) throw legacyImage.error

  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.body,
    image: legacyImage?.data.signedUrl ?? null,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pinned: row.is_pinned,
    color: row.color,
    fontFamily: row.font_family,
    reminderAt: row.reminder_at,
    archivedAt: row.archived_at,
    imageAttachments,
  }
}

const uploadNoteImage = async (userId: string, image: File) => {
  const extensionByType: Record<string, string> = {
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  }
  const extension = extensionByType[image.type]
  if (!extension) throw new Error('Choose a JPEG, PNG, WebP, or GIF image.')
  if (image.size > 10 * 1024 * 1024) throw new Error('Note images must be 10 MB or smaller.')

  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from('note-images')
    .upload(path, image, { contentType: image.type, upsert: false })
  if (error) throw error
  return path
}

const cleanupImage = async (path: string, message: string) => {
  const { error } = await supabase.storage.from('note-images').remove([path])
  if (error) console.error(message, error)
}

const persistImageAttachments = async (userId: string, attachments: NoteImageAttachment[] = []) => {
  const stored: { id: string; path: string; width: number }[] = []
  const uploadedPaths: string[] = []

  try {
    for (const attachment of attachments) {
      if (attachment.file) {
        const path = await uploadNoteImage(userId, attachment.file)
        uploadedPaths.push(path)
        stored.push({ id: attachment.id, path, width: attachment.width })
      } else if (attachment.path) {
        if (!attachment.path.startsWith(`${userId}/`)) {
          throw new Error('An attached image does not belong to your account.')
        }
        stored.push({ id: attachment.id, path: attachment.path, width: attachment.width })
      }
    }
    return { stored, uploadedPaths }
  } catch (error) {
    await Promise.all(uploadedPaths.map((path) =>
      cleanupImage(path, 'Unable to clean up an unreferenced note image:')
    ))
    throw error
  }
}

const removeUnusedImages = async (
  previous: NoteImageAttachment[] = [],
  next: { path: string }[] = []
) => {
  const nextPaths = new Set(next.map((image) => image.path))
  const removedPaths = [...new Set(previous
    .map((image) => image.path)
    .filter((path): path is string => path !== undefined && !nextPaths.has(path)))]
  await Promise.all(removedPaths.map((path) =>
    cleanupImage(path, 'Unable to remove a detached note image:')
  ))
}

const reportMutationError = (action: string) => (error: Error) => {
  console.error(`${action} failed:`, error)
  window.alert(error.message || `${action} failed. Please try again.`)
}

export const useNotes = (userId: string | undefined) => useQuery({
  queryKey: userId ? noteKeys.list(userId) : [...noteKeys.all, 'signed-out'],
  enabled: Boolean(userId),
  staleTime: 40 * 60 * 1000,
  queryFn: async () => {
    if (!userId) throw new Error('You must be signed in to manage notes.')
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return Promise.all((data as NoteRow[]).map(toNote))
  }
})

export const useNoteMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const invalidateNotes = async () => {
    if (userId) await queryClient.invalidateQueries({ queryKey: noteKeys.list(userId) })
  }

  const addNote = useMutation({
    mutationFn: async (note: Note) => {
      if (!userId) throw new Error('You must be signed in to manage notes.')
      const imagePath = note.image instanceof File
        ? await uploadNoteImage(userId, note.image)
        : null
      const { stored: imageAttachments, uploadedPaths } = await persistImageAttachments(userId, note.imageAttachments)
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: note.title.trim(),
          body: note.description,
          image_path: imagePath,
          is_pinned: note.pinned ?? false,
          color: note.color ?? 'default',
          font_family: note.fontFamily ?? 'sans',
          reminder_at: note.reminderAt ?? null,
          image_attachments: imageAttachments
        })
        .select('*')
        .single()
      if (error) {
        await Promise.all([...uploadedPaths, ...(imagePath ? [imagePath] : [])].map((path) =>
          cleanupImage(path, 'Unable to clean up an unreferenced note image:')
        ))
        throw error
      }
      return toNote(data as NoteRow)
    },
    onSuccess: invalidateNotes,
    onError: reportMutationError('Adding note')
  })

  const editNote = useMutation({
    mutationFn: async (note: Note) => {
      if (!userId) throw new Error('You must be signed in to manage notes.')
      if (!note._id) throw new Error('Cannot update a note without its ID.')
      const uploadedPath = note.image instanceof File
        ? await uploadNoteImage(userId, note.image)
        : null
      const { stored: imageAttachments, uploadedPaths } = await persistImageAttachments(userId, note.imageAttachments)
      const removeImage = note.image === null && Boolean(note.imagePath)
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: note.title.trim(),
          body: note.description,
          is_pinned: note.pinned ?? false,
          color: note.color ?? 'default',
          font_family: note.fontFamily ?? 'sans',
          reminder_at: note.reminderAt ?? null,
          archived_at: note.archivedAt ?? null,
          image_attachments: imageAttachments,
          ...(uploadedPath ? { image_path: uploadedPath } : {}),
          ...(removeImage ? { image_path: null } : {})
        })
        .eq('id', note._id)
        .eq('user_id', userId)
        .select('*')
        .single()
      if (error) {
        await Promise.all([...uploadedPaths, ...(uploadedPath ? [uploadedPath] : [])].map((path) =>
          cleanupImage(path, 'Unable to clean up an unreferenced note image:')
        ))
        throw error
      }
      const savedNote = await toNote(data as NoteRow)
      if ((uploadedPath || removeImage) && note.imagePath) {
        await cleanupImage(note.imagePath, 'Unable to remove the replaced note image:')
      }
      await removeUnusedImages(note.imageAttachments, imageAttachments)
      return savedNote
    },
    onSuccess: invalidateNotes,
    onError: reportMutationError('Updating note')
  })

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      if (!userId) throw new Error('You must be signed in to manage notes.')
      const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId)
        .select('id, image_path, image_attachments')
        .single()
      if (error) throw error
      const imagePaths = new Set([
        ...(data.image_path ? [data.image_path] : []),
        ...((data.image_attachments ?? []) as { path: string }[]).map((image) => image.path),
      ])
      await Promise.all([...imagePaths].map((path) =>
        cleanupImage(path, 'Unable to remove the deleted note image:')
      ))
      return data.id
    },
    onSuccess: invalidateNotes,
    onError: reportMutationError('Deleting note')
  })

  return { addNote, editNote, deleteNote }
}
