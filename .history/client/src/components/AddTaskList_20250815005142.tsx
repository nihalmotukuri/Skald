import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux/store'
import { addTaskList } from '@/redux/userThunks'
import { CiBoxList } from "react-icons/ci"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AddTaskList = () => {
    const [open, setOpen] = useState(false)
    const [newTaskList, setNewTaskList] = useState('')
    const dispatch = useDispatch<AppDispatch>()

    const onAddTaskList = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newTaskList.trim()) return
        dispatch(addTaskList(newTaskList))
        setNewTaskList('')
        setOpen(false)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={`flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer`}
                    onClick={() => setOpen(true)}
                >
                    <CiBoxList />
                    <span className="text-[14px]">New List</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-md shadow-lg absolute z-[1] w-[240px] right-[-180px] text-white p-[12px]" align="start">
                <form className='flex flex-col' onSubmit={onAddTaskList}>
                    <label className='text-[15px]' htmlFor="title">Task List</label>
                    <input
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] mt-[4px]'
                        type="text"
                        name="title"
                        value={newTaskList}
                        onChange={e => setNewTaskList(e.target.value)}
                    />
                    <button
                        className='cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] mt-[14px]'
                        type="submit"
                    >
                        Add New List
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AddTaskList
