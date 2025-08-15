import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { addTask } from '@/redux/tasksThunks'
import { RxCross2 } from "react-icons/rx"
import type { Task } from '@/types/task'
import SelectPriority from './SelectPriority'
import SelectTaskList from './SelectTaskList'
import SelectStatus from './SelectStatus'

interface AddTaskDialogProps {
    setDisplayAddTask: (value: boolean) => void;
}

const AddTaskDialog = ({ setDisplayAddTask }: AddTaskDialogProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((store: RootState) => store.userStore)
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const [addTaskData, setAddTaskData] = useState({
        title: '',
        description: '',
        status: 'Pending',
        date: '',
        time: '',
        taskList: '',
    })
    const [priority, setPriority] = useState('')

    const selectPriority = (selectedPriority: string) => setPriority(selectedPriority)
    const selectTaskList = (selectedTaskList: string) => setAddTaskData({ ...addTaskData, taskList: selectedTaskList })
    const selectStatus = (selectedStatus: string) => setAddTaskData({ ...addTaskData, status: selectedStatus })

    const onAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const newTask: Task = {
            firebaseUid: user?.firebaseUid ?? '',
            ...addTaskData,
            priority
        }

        dispatch(addTask(newTask))

        // Reset form
        setAddTaskData({
            title: '',
            description: '',
            status: 'Pending',
            date: '',
            time: '',
            taskList: '',
        })
        setPriority('')
        setDisplayAddTask(false)
    }

    return (
        <section className={`fixed top-0 left-0 z-999 ${isDark ? "bg-black/40" : "bg-gray-300/30" } h-full w-full flex justify-center items-center`}>
            <form
                onSubmit={onAddTask}
                className={`${isDark ? "bg-white/6 border-white/10" : "bg-black/4 border-black/30"} backdrop-blur-xl border rounded-md p-[24px] w-[420px] flex flex-col gap-[18px] relative`}
            >
                <div
                    className={`absolute top-0 right-0 p-[6px] ${isDark ? "hover:bg-white/10" : "hover:bg-gray-400/40"} text-red-5 cursor-pointer`}
                    style={{ borderBottomLeftRadius: "7px", borderTopRightRadius: "7px" }}
                    onClick={() => setDisplayAddTask(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-300 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                        type="text"
                        name="title"
                        value={addTaskData.title}
                        onChange={e => setAddTaskData({ ...addTaskData, title: e.currentTarget.value })}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px] resize-none`}
                        rows={5}
                        value={addTaskData.description}
                        onChange={e => setAddTaskData({ ...addTaskData, description: e.currentTarget.value })}
                    ></textarea>
                </div>

                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="date">Date</label>
                        <input
                            className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                            type="date"
                            name="date"
                            value={addTaskData.date}
                            onChange={e => setAddTaskData({ ...addTaskData, date: e.currentTarget.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="time">Time</label>
                        <input
                            className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                            type="time"
                            value={addTaskData.time}
                            onChange={e => setAddTaskData({ ...addTaskData, time: e.currentTarget.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]'>Priority</label>
                        <SelectPriority selectPriority={selectPriority} currentPriority="" />
                    </div>
                </div>

                <div className='flex justify-between gap-6'>
                    <div className='flex flex-col gap-2 w-full'>
                        <label className='text-[15px]'>Task List</label>
                        <SelectTaskList selectTaskList={selectTaskList} currentTaskList="" />
                    </div>

                    <div className='flex flex-col gap-2 w-full'>
                        <label className='text-[15px]'>Status</label>
                        <SelectStatus selectStatus={selectStatus} currentStatus="" />
                    </div>
                </div>

                <button
                    type='submit'
                    className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md text-[14px] px-[12px] py-[6px] cursor-pointer hover:bg-white/10'
                >
                    Add Task
                </button>
            </form>
        </section>
    )
}

export default AddTaskDialog
