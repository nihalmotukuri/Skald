import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import {
  Archive,
  Bell,
  Bold,
  Check,
  Code2,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Pin,
  Quote,
  Redo2,
  RemoveFormatting,
  RotateCcw,
  Strikethrough,
  X,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useNoteMutations } from '@/queries/notes'
import type { Note } from '@/types/note'
import WorkspaceDialog from './WorkspaceDialog'
import { editorHtmlToMarkdown, markdownToEditorHtml, stripInlineNoteImages } from './noteRichText'

interface NoteEditorDialogProps {
  note?: Note
  onClose: () => void
}

const colors: NonNullable<Note['color']>[] = ['default', 'rose', 'amber', 'sage', 'blue', 'violet']
const fonts: { value: NonNullable<Note['fontFamily']>; label: string }[] = [
  { value: 'sans', label: 'Sans serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
]

const toLocalDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

const NoteEditorDialog = ({ note, onClose }: NoteEditorDialogProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const { addNote, editNote } = useNoteMutations(userId)
  const titleRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const activeTextFieldRef = useRef<HTMLDivElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(stripInlineNoteImages(note?.description ?? ''))
  const [initialTitleHtml] = useState(() => markdownToEditorHtml(note?.title ?? '', true))
  const [initialBodyHtml] = useState(() => markdownToEditorHtml(note?.description ?? ''))
  const [activeField, setActiveField] = useState<'title' | 'body'>('title')
  const [imageAttachments, setImageAttachments] = useState<NonNullable<Note['imageAttachments']>>(() => {
    const attached = note?.imageAttachments?.[0]
    if (attached) return [attached]
    if (note?.imagePath && typeof note.image === 'string') {
      return [{ id: 'legacy', path: note.imagePath, url: note.image, width: 100 }]
    }
    return []
  })
  const [pinned, setPinned] = useState(note?.pinned ?? false)
  const [color, setColor] = useState<NonNullable<Note['color']>>(note?.color ?? 'default')
  const [fontFamily, setFontFamily] = useState<NonNullable<Note['fontFamily']>>(note?.fontFamily ?? 'sans')
  const [reminderAt, setReminderAt] = useState(toLocalDateTime(note?.reminderAt))
  const [showFormatting, setShowFormatting] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )
  const [imageError, setImageError] = useState('')
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const saving = addNote.isPending || editNote.isPending
  const noteId = note?._id

  useEffect(() => {
    const previews: Record<string, string> = {}
    const createdUrls: string[] = []
    imageAttachments.forEach((attachment) => {
      if (attachment.file) {
        const url = URL.createObjectURL(attachment.file)
        previews[attachment.id] = url
        createdUrls.push(url)
      } else if (attachment.url) {
        previews[attachment.id] = attachment.url
      }
    })
    setImagePreviews(previews)
    return () => createdUrls.forEach(URL.revokeObjectURL)
  }, [imageAttachments])

  const preserveTextSelection = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault()

  const insertImages = (files: FileList | null) => {
    if (!files?.length) return
    const selected = [...files]
    if (selected.length > 1 || imageAttachments.length > 0) {
      setImageError(imageAttachments.length ? 'Remove the attached image before adding another.' : 'Choose one image at a time.')
      return
    }
    const supported = selected.filter((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))
    if (supported.length !== selected.length) {
      setImageError('Choose JPEG, PNG, WebP, or GIF images.')
      return
    }
    const oversized = supported.find((file) => file.size > 10 * 1024 * 1024)
    if (oversized) {
      setImageError(`${oversized.name} is larger than 10 MB.`)
      return
    }
    setImageError('')
    setImageAttachments([{ id: crypto.randomUUID(), file: supported[0], width: 100 }])
  }

  const removeImage = (attachmentId: string) => {
    setImageAttachments((previous) => previous.filter((attachment) => attachment.id !== attachmentId))
  }

  const syncEditor = (field: HTMLDivElement) => {
    const markdown = editorHtmlToMarkdown(field, field === titleRef.current)
    if (field === titleRef.current) setTitle(markdown)
    else setBody(markdown)
  }

  const applyCommand = (command: string, value?: string) => {
    const field = activeTextFieldRef.current
    if (!field) return
    field.focus()
    document.execCommand(command, false, value)
    syncEditor(field)
  }

  const applyChecklist = () => {
    applyCommand('insertUnorderedList')
    const field = activeTextFieldRef.current
    const selection = document.getSelection()
    const anchor = selection?.anchorNode
    const item = anchor instanceof HTMLElement
      ? anchor.closest('li')
      : anchor?.parentElement?.closest('li')
    if (field && field === bodyRef.current && item) {
      item.setAttribute('data-task-item', 'true')
      syncEditor(field)
    }
  }

  const onTextFieldKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && event.currentTarget === titleRef.current) {
      event.preventDefault()
      return
    }
    if (!(event.metaKey || event.ctrlKey)) return
    if (event.key.toLowerCase() === 'b') {
      event.preventDefault()
      applyCommand('bold')
    } else if (event.key.toLowerCase() === 'i') {
      event.preventDefault()
      applyCommand('italic')
    } else if (event.key.toLowerCase() === 'z') {
      event.preventDefault()
      document.execCommand(event.shiftKey ? 'redo' : 'undo')
      requestAnimationFrame(() => {
        const field = activeTextFieldRef.current
        if (field) syncEditor(field)
      })
    }
  }

  const plainTitle = title.replace(/[*_~`#]/g, '').trim()

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!plainTitle) {
      titleRef.current?.focus()
      return
    }
    const saved: Note = {
      ...(note ?? { title: '', description: '', image: null }),
      title,
      description: body,
      image: null,
      imageAttachments,
      pinned,
      color,
      fontFamily,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
    }

    if (noteId) {
      editNote.mutate(saved, {
        onSuccess: (updated) => {
          setActiveNoteId(updated._id ?? null)
          onClose()
        },
      })
    } else {
      addNote.mutate(saved, {
        onSuccess: (created) => {
          setActiveNoteId(created._id ?? null)
          onClose()
        },
      })
    }
  }

  const archive = () => {
    if (!noteId || !note) return
    editNote.mutate({
      ...note,
      title,
      description: body,
      image: null,
      imageAttachments,
      pinned,
      color,
      fontFamily,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      archivedAt: note.archivedAt ? null : new Date().toISOString(),
    }, {
      onSuccess: () => {
        setActiveNoteId(null)
        onClose()
      },
    })
  }

  return (
    <WorkspaceDialog labelledBy="skald-note-dialog-title" onClose={onClose} dark={isDark} className="skald-note-editor">
      <form onSubmit={save} className={`skald-note-editor__form skald-note-color--${color}`}>
        <div className="skald-note-editor__top">
          <div
            autoFocus
            ref={titleRef}
            id="skald-note-title"
            className="skald-note-editor__title"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="false"
            data-placeholder="Title"
            aria-label="Note title"
            dangerouslySetInnerHTML={{ __html: initialTitleHtml }}
            onFocus={(event) => {
              activeTextFieldRef.current = event.currentTarget
              setActiveField('title')
            }}
            onInput={(event) => syncEditor(event.currentTarget)}
            onKeyDown={onTextFieldKeyDown}
          />
          <button
            type="button"
            className={`skald-note-editor__icon-button ${pinned ? 'is-active' : ''}`}
            onClick={() => setPinned((value) => !value)}
            aria-label={pinned ? 'Unpin note' : 'Pin note'}
            aria-pressed={pinned}
            title={pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={19} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={bodyRef}
          id="skald-note-body"
          className={`skald-note-editor__body skald-note-font--${fontFamily}`}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Note content"
          data-placeholder="Take a note…"
          dangerouslySetInnerHTML={{ __html: initialBodyHtml }}
          onFocus={(event) => {
            activeTextFieldRef.current = event.currentTarget
            setActiveField('body')
          }}
          onInput={(event) => syncEditor(event.currentTarget)}
          onKeyDown={onTextFieldKeyDown}
        />

        {imageAttachments.length > 0 && (
          <div className="skald-note-editor__attachments" aria-label="Attached image">
            {imageAttachments.map((attachment) => (
              <div className="skald-note-editor__attachment" key={attachment.id}>
                {imagePreviews[attachment.id] && <img src={imagePreviews[attachment.id]} alt={attachment.file?.name ?? 'Attached image'} />}
                <span>{attachment.file?.name ?? 'Attached image'}</span>
                <button type="button" onClick={() => removeImage(attachment.id)} aria-label="Remove attached image">
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
        {imageError && <p className="skald-note-editor__image-error" role="alert">{imageError}</p>}

        {showFormatting && (
          <div className="skald-note-editor__format-panel" role="toolbar" aria-label="Text formatting">
            <button type="button" aria-label="Bold" title="Bold (Ctrl+B)" onMouseDown={preserveTextSelection} onClick={() => applyCommand('bold')}><Bold size={16} /></button>
            <button type="button" aria-label="Italic" title="Italic (Ctrl+I)" onMouseDown={preserveTextSelection} onClick={() => applyCommand('italic')}><Italic size={16} /></button>
            <button type="button" aria-label="Strikethrough" title="Strikethrough" onMouseDown={preserveTextSelection} onClick={() => applyCommand('strikeThrough')}><Strikethrough size={16} /></button>
            <span />
            <button type="button" aria-label="Heading" title="Heading" onMouseDown={preserveTextSelection} onClick={() => applyCommand('formatBlock', 'H2')} disabled={activeField !== 'body'}><Heading2 size={16} /></button>
            <button type="button" aria-label="Bulleted list" title="Bulleted list" onMouseDown={preserveTextSelection} onClick={() => applyCommand('insertUnorderedList')} disabled={activeField !== 'body'}><List size={16} /></button>
            <button type="button" aria-label="Numbered list" title="Numbered list" onMouseDown={preserveTextSelection} onClick={() => applyCommand('insertOrderedList')} disabled={activeField !== 'body'}><ListOrdered size={16} /></button>
            <button type="button" aria-label="Checklist" title="Checklist" onMouseDown={preserveTextSelection} onClick={applyChecklist} disabled={activeField !== 'body'}><ListChecks size={16} /></button>
            <button type="button" aria-label="Quote" title="Quote" onMouseDown={preserveTextSelection} onClick={() => applyCommand('formatBlock', 'BLOCKQUOTE')} disabled={activeField !== 'body'}><Quote size={16} /></button>
            <button type="button" aria-label="Code" title="Code" onMouseDown={preserveTextSelection} onClick={() => applyCommand('formatBlock', 'PRE')}><Code2 size={16} /></button>
            <select
              aria-label="Note font"
              value={fontFamily}
              onChange={(event) => setFontFamily(event.target.value as NonNullable<Note['fontFamily']>)}
            >
              {fonts.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
            </select>
          </div>
        )}

        {showColors && (
          <div className="skald-note-editor__color-panel" role="group" aria-label="Note color">
            {colors.map((option) => (
              <button
                type="button"
                key={option}
                className={`skald-note-color-swatch skald-note-color--${option} ${color === option ? 'is-selected' : ''}`}
                onClick={() => setColor(option)}
                aria-label={`${option} note color`}
                aria-pressed={color === option}
              >
                {color === option && <Check size={14} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}

        {showReminder && (
          <div className="skald-note-editor__reminder-panel">
            <label htmlFor="skald-note-reminder">Remind me</label>
            <input
              id="skald-note-reminder"
              type="datetime-local"
              min={toLocalDateTime(new Date().toISOString())}
              value={reminderAt}
              onChange={(event) => setReminderAt(event.target.value)}
            />
            {reminderAt && (
              <button type="button" onClick={() => setReminderAt('')}>Remove reminder</button>
            )}
            {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    setNotificationPermission(await Notification.requestPermission())
                  } catch (error) {
                    console.error('Unable to request reminder notifications:', error)
                    setNotificationPermission('denied')
                  }
                }}
              >
                Enable browser alerts
              </button>
            )}
            {notificationPermission === 'unsupported' && <span>Browser alerts are not available here.</span>}
            {notificationPermission === 'denied' && <span>Alerts are blocked in browser settings.</span>}
          </div>
        )}

        <footer className="skald-note-editor__toolbar">
          <div className="skald-note-editor__tools">
            <button type="button" aria-label="Text formatting" aria-pressed={showFormatting} onClick={() => setShowFormatting((value) => !value)}>
              <RemoveFormatting size={17} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Note color" aria-pressed={showColors} onClick={() => {
              setShowColors((value) => !value)
              setShowReminder(false)
            }}>
              <span className={`skald-note-editor__color-dot skald-note-color--${color}`} />
            </button>
            <button type="button" aria-label="Set reminder" aria-pressed={showReminder} onClick={() => {
              setShowReminder((value) => !value)
              setShowColors(false)
            }}>
              <Bell size={17} aria-hidden="true" />
            </button>
            <label className="skald-note-editor__tool" aria-label="Insert images" title="Insert images">
              <ImagePlus size={17} aria-hidden="true" />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => {
                  insertImages(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            {noteId && (
              <button type="button" aria-label={note?.archivedAt ? 'Restore note' : 'Archive note'} title={note?.archivedAt ? 'Restore note' : 'Archive note'} onClick={archive} disabled={saving}>
                <Archive size={16} aria-hidden="true" />
              </button>
            )}
            <button type="button" aria-label="Undo" title="Undo (Ctrl+Z)" onMouseDown={preserveTextSelection} onClick={() => applyCommand('undo')}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" onMouseDown={preserveTextSelection} onClick={() => applyCommand('redo')}>
              <Redo2 size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="skald-note-editor__footer-actions">
            {note?.updatedAt && (
              <span className="skald-note-editor__edited">
                Edited {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(note.updatedAt))}
              </span>
            )}
            <button type="button" className="skald-note-editor__close" onClick={onClose}>Cancel</button>
            <button type="submit" className="skald-note-editor__save" disabled={saving || !plainTitle}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </footer>
      </form>
    </WorkspaceDialog>
  )
}

export default NoteEditorDialog
