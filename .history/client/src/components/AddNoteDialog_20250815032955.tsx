import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store";
import { addNote } from "@/redux/notesThunks";
import { RxCross2 } from "react-icons/rx"
import type { Note } from '@/types/note.ts'

interface AddNoteDialogProps {
    setDisplayAddNote: (value: boolean) => void;
}

const AddNoteDialog = ({ setDisplayAddNote }: AddNoteDialogProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((store: RootState) => store.userStore)
    const firebaseUid = user?.firebaseUid ?? ''
    const [noteForm, setNoteForm] = useState<Note>({
        firebaseUid,
        title: '',
        description: '',
        image: null
    })
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const imageRef = useRef<HTMLInputElement>(null)

    const onAddNote = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        dispatch(addNote(noteForm))

        setNoteForm({
            firebaseUid,
            title: '',
            description: '',
            image: null
        })

        if (imageRef.current) {
            imageRef.current.value = ''
        }

        setDisplayAddNote(false)
    }

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNoteForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        setNoteForm(prev => ({
            ...prev,
            image: file
        }))
    }

    return (
        <section className={`fixed top-0 left-0 z-999 ${isDark ? "bg-black/40" : "bg-gray-300/30"} h-full w-full flex justify-center items-center`}>
            <form
                onSubmit={onAddNote}
                className={`${isDark ? "bg-white/6 border-white/10" : "bg-black/4 border-black/30"} backdrop-blur-xl border rounded-md p-[24px] w-[420px] flex flex-col gap-[18px] relative`}
            >
                <div
                    className={`absolute top-0 right-0 p-[6px] ${isDark ? "hover:bg-white/10" : "hover:bg-gray-400/40"} text-red-5 cursor-pointer`}
                    style={{ borderBottomLeftRadius: "7px", borderTopRightRadius: "7px" }}
                    onClick={() => setDisplayAddNote(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                        type="text"
                        name="title"
                        onChange={handleNoteChange}
                        value={noteForm.title}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px] resize-none`}
                        rows={12}
                        onChange={handleNoteChange}
                        value={noteForm.description}
                    ></textarea>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="image">Image</label>
                    <input
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px] resize-none cursor-pointer`}
                        type="file"
                        accept='image/*'
                        onChange={handleImageChange}
                        ref={imageRef}
                    />
                </div>

                <button
                    className={`${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-neutral-100/20 !border-black/30 hover:bg-neutral-100/40"} backdrop-blur-md border rounded-md text-[12px] px-[12px] py-[6px] w-full cursor-pointer`}
                    type='submit'>
                    Add Note
                </button>
            </form>
        </section>
    )
}

export default AddNoteDialog
