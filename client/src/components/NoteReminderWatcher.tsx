import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useNotes } from '@/queries/notes'

const NoteReminderWatcher = () => {
  const userId = useAppStore((state) => state.user?.id)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const { data: notes = [] } = useNotes(userId)
  const navigate = useNavigate()
  const delivered = useRef(new Set<string>())

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

    const checkReminders = () => {
      const now = Date.now()
      notes.forEach((note) => {
        if (!note._id || !note.reminderAt || note.archivedAt) return
        const dueAt = new Date(note.reminderAt).getTime()
        if (!Number.isFinite(dueAt) || dueAt > now) return

        const storageKey = `skald-note-reminder:${note._id}:${note.reminderAt}`
        if (delivered.current.has(storageKey)) return
        delivered.current.add(storageKey)

        try {
          const notification = new Notification(note.title || 'A note reminder', {
            body: 'A note you saved is due for a look.',
            tag: storageKey,
          })
          notification.onclick = () => {
            window.focus()
            setActiveNoteId(note._id ?? null)
            navigate('/app/notes')
            notification.close()
          }
        } catch (error) {
          delivered.current.delete(storageKey)
          console.error('Unable to show a note reminder notification:', error)
        }
      })
    }

    checkReminders()
    const intervalId = window.setInterval(checkReminders, 30_000)
    return () => window.clearInterval(intervalId)
  }, [navigate, notes, setActiveNoteId])

  return null
}

export default NoteReminderWatcher
