import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setActiveNoteId } from "@/redux/notesSlice"
import type { AppDispatch, RootState } from "@/redux/store";
import type { Note } from "@/types/note";
import type React from "react"
import { deleteNote } from "@/redux/notesThunks"
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md"
import dayjs from "dayjs"

interface NoteItemProps {
  note: Note;
  setEditNoteId: React.Dispatch<React.SetStateAction<string>>;
  setDisplayEditNote: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoteItem = ({ note, setEditNoteId, setDisplayEditNote }: NoteItemProps) => {
    const [displayBtns, setDisplayBtns] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { activeNoteId } = useSelector((store: RootState) => store.notesStore)
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const onNoteItem = (note: Note) => {
        dispatch(setActiveNoteId(note._id))
    }

    const onEditNote = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation()
        setEditNoteId(noteId)
        setDisplayEditNote(true)
    }

    const onDeleteNote = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation()
        dispatch(setActiveNoteId(''))
        dispatch(deleteNote(noteId))
    }

    const formatTaskDate = (date: string) => {
        const d = dayjs(date)
        const now = dayjs()

        if (now.diff(d, "minute") < 1) return "Just now"
        if (d.isSame(now, "day")) return "Today"
        if (d.isSame(now.subtract(1, "day"), "day")) return "Yesterday"
        return d.format("DD MMM")
    }

    return (
        <div
            key={note._id}
            onClick={() => onNoteItem(note)}
            className={`w-full py-[18px] px-[22px] cursor-pointer transition duration-80 ease-in-out border ${activeNoteId && activeNoteId === note._id ? (isDark ? "border-white/50" : "!border-black/50") : ("border-transparent")} ${isDark ? "hover:bg-white/6 bg-white/4" : "hover:bg-neutral100 bg-white !border-black/10"} rounded-xl border-box shadow-md`}
            onMouseEnter={() => setDisplayBtns(true)}
            onMouseLeave={() => setDisplayBtns(false)}
        >
            <h1 className="font-bold text-[20px]">{note.title}</h1>
            <p className="text-slate-500 line-clamp-2 text-[14px] mt-[2px]">{note.description}</p>
            {note.image && (
                <img
                    className="h-[80px] w-[120px] mt-[16px] object-cover rounded-lg"
                    src={note.image instanceof File ? URL.createObjectURL(note.image) : note.image}
                />
            )}
            <div className="relative">
                <p className="text-slate-600 text-[14px] mt-[12px]">{formatTaskDate(note.createdAt!)}</p>

                <div className={`absolute z-1 top-[-4px] right-0 flex gap-3 ${displayBtns ? "block" : "hidden"}`}>
                    <div
                        className={`p-2 ${isDark ? "bg-white/10 hover:border-white/40" : "bg-black/10 hover:border-black/40"} rounded-md hover:bg-transparent border border-transparent`}
                        onClick={(e) => onEditNote(e, note._id!)}
                    >
                        <MdOutlineEdit />
                    </div>

                    <div
                        className={`p-2 ${isDark ? "bg-white/10 hover:border-white/40" : "bg-black/10 hover:border-black/40"} rounded-md hover:bg-transparent border border-transparent`}
                        onClick={(e) => onDeleteNote(e, note._id!)}
                    >
                        <MdDeleteOutline />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoteItem
