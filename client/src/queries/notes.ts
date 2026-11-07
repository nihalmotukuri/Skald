import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Note } from '@/types/note'
import { supabase } from '@/lib/supabase'

interface NoteRow {
  id: string
  user_id: string
  title: string
  body: string
  image_path: string | null
  created_at: string
}

export const noteKeys = {
  all: ['notes'] as const,
  list: (userId: string) => [...noteKeys.all, userId] as const
}

const toNote = async (row: NoteRow): Promise<Note> => {
  let image: string | null = null
  if (row.image_path) {
    const { data, error } = await supabase.storage
      .from('note-images')
      .createSignedUrl(row.image_path, 60 * 60)
    if (error) throw error
    image = data.signedUrl
  }

  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.body,
    image,
    imagePath: row.image_path,
    createdAt: row.created_at
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
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: note.title.trim(),
          body: note.description,
          image_path: imagePath
        })
        .select('*')
        .single()
      if (error) {
        if (imagePath) await cleanupImage(imagePath, 'Unable to clean up an unreferenced note image:')
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
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: note.title.trim(),
          body: note.description,
          ...(uploadedPath ? { image_path: uploadedPath } : {})
        })
        .eq('id', note._id)
        .eq('user_id', userId)
        .select('*')
        .single()
      if (error) {
        if (uploadedPath) await cleanupImage(uploadedPath, 'Unable to clean up an unreferenced note image:')
        throw error
      }
      const savedNote = await toNote(data as NoteRow)
      if (uploadedPath && note.imagePath) {
        await cleanupImage(note.imagePath, 'Unable to remove the replaced note image:')
      }
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
        .select('id, image_path')
        .single()
      if (error) throw error
      if (data.image_path) await cleanupImage(data.image_path, 'Unable to remove the deleted note image:')
      return data.id
    },
    onSuccess: invalidateNotes,
    onError: reportMutationError('Deleting note')
  })

  return { addNote, editNote, deleteNote }
}
