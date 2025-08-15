import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { setActiveNoteId } from '@/redux/notesSlice'
import { editNote } from '@/redux/notesThunks'
import type React from 'react'
import { RxCross2 } from "react-icons/rx"
import type { Note } from '@/types/note'

interface AddTaskDialogProps {
    setDisplayEditNote: (value: boolean) => void;
    editNoteId: string
}

const EditNoteDialog = ({ setDisplayEditNote, editNoteId }: AddTaskDialogProps) => {
    const { notes } = useSelector((store: RootState) => store.notesStore)
    const [editedNote, setEditedNote] = useState<Note | undefined>(() => notes.find((n: Note) => n._id === editNoteId))
    const imageRef = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const onEditNote = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editedNote) return;
        dispatch(editNote(editedNote));
        dispatch(setActiveNoteId(editedNote._id))
        setDisplayEditNote(false);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setEditedNote(prev => prev ? { ...prev, image: file } : undefined)
    }

    return (
        <section className={`fixed top-0 left-0 z-999 ${isDark ? "bg-black/40" : "bg-gray-300/30"} h-full w-full flex justify-center items-center`}>
            <form
                onSubmit={onEditNote}
                className={`${isDark ? "bg-white/6 border-white/10" : "bg-black/4 border-black/30"} backdrop-blur-xl border rounded-md p-[24px] w-[420px] flex flex-col gap-[18px] relative`}
            >
                <div
                    className={`absolute top-0 right-0 p-[6px] ${isDark ? "hover:bg-white/10" : "hover:bg-gray-400/40"} text-red-5 cursor-pointer`}
                    style={{
                        borderBottomLeftRadius: "7px",
                        borderTopRightRadius: "7px"
                    }}
                    onClick={() => setDisplayEditNote(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                        type="text"
                        name="title"
                        onChange={(e) => setEditedNote(prev => prev ? { ...prev, title: e.currentTarget.value } : undefined)}
                        value={editedNote?.title ?? ''}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] resize-none'
                        rows={12}
                        onChange={(e) => setEditedNote(prev => prev ? { ...prev, description: e.currentTarget.value } : undefined)}
                        value={editedNote?.description}
                    ></textarea>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="image">Image</label>
                    <input
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] resize-none cursor-pointer'
                        type="file"
                        accept='image/*'
                        onChange={handleImageChange}
                        ref={imageRef}
                    />
                </div>

                <button
                    className='bg-white/6 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] cursor-pointer hover:bg-white/10'
                    type='submit'>
                    Edit Note
                </button>
            </form>
        </section>
    )
}

export default EditNoteDialog
