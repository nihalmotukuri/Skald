import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { editTask } from '@/redux/tasksThunks'
import type React from 'react'
import { RxCross2 } from "react-icons/rx"
import SelectStatus from './SelectStatus'
import SelectPriority from './SelectPriority'
import SelectTaskList from './SelectTaskList'

interface AddTaskDialogProps {
    setDisplayEditTask: (value: boolean) => void;
    editTaskId: string
}

const EditTaskDialog = ({ setDisplayEditTask, editTaskId }: AddTaskDialogProps) => {
    const { tasks } = useSelector((store: RootState) => store.tasksStore)
    const [editedTask, setEditedTask] = useState(() => tasks.find(t => t._id === editTaskId))
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const selectTaskList = (taskList: string) => {
        setEditedTask({ ...editedTask, taskList })
    }

    const dispatch = useDispatch<AppDispatch>()

    const selectPriority = (priority: string) => {
        setEditedTask({ ...editedTask, priority })
    }

    const selectStatus = (status: string) => {
        if (status === "Done") {
            setEditedTask({ ...editedTask, status, completed: true, completedAt: new Date() })
        } else {
            setEditedTask({ ...editedTask, status, completed: false, completedAt: null })
        }
    }

    const onEditTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!editedTask) return;
        dispatch(editTask(editedTask));
        setDisplayEditTask(false);
    }

    return (
        <section className={`fixed top-0 left-0 z-999 ${isDark ? "bg-black/40" : "bg-gray-300/30" } h-full w-full flex justify-center items-center`}>
            <form
                onSubmit={onEditTask}
                className={`${isDark ? "bg-white/6 border-white/10" : "bg-black/4 border-black/30"} backdrop-blur-xl border rounded-md p-[24px] w-[420px] flex flex-col gap-[18px] relative`}
            >
                <div
                    className='absolute top-0 right-0 p-[6px] hover:bg-white/10 text-red-5 cursor-pointer'
                    style={{
                        borderBottomLeftRadius: "7px",
                        borderTopRightRadius: "7px"
                    }}
                    onClick={() => setDisplayEditTask(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px]`}
                        type="text"
                        name="title"
                        onChange={e => {
                            if (!editedTask) return;
                            setEditedTask({ ...editedTask, title: e.currentTarget.value });
                        }}
                        value={editedTask?.title ?? ""}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className=`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100/20 !border-black/30"} backdrop-blur-md border rounded-md text-[14px] px-[12px] py-[6px] resize-none`}
                        rows={5}
                        onChange={e => {
                            if (!editedTask) return;
                            setEditedTask({ ...editedTask, description: e.currentTarget.value })
                        }}
                        value={editedTask?.description ?? ""}
                    ></textarea>
                </div>

                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="date">Date</label>
                        <input
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                            type="date"
                            name="date"
                            onChange={e => {
                                if (!editedTask) return;
                                setEditedTask({ ...editedTask, date: e.currentTarget.value })
                            }}
                            value={editedTask?.date ?? ""}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="time">Time</label>
                        <input
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                            type="time"
                            onChange={e => {
                                if (!editedTask) return;
                                setEditedTask({ ...editedTask, time: e.currentTarget.value })
                            }}
                            value={editedTask?.time ?? ""}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]'>Priority</label>
                        <SelectPriority
                            selectPriority={selectPriority}
                            currentPriority={editedTask?.priority ?? ""}
                        />
                    </div>
                </div>

                <div className='flex justify-between gap-6'>
                    <div className='flex flex-col gap-2 w-full'>
                        <label className='text-[15px]' htmlFor="time">Task List</label>
                        <SelectTaskList
                            selectTaskList={selectTaskList}
                            currentTaskList={editedTask?.taskList ?? ""}
                        />
                    </div>

                    <div className='flex flex-col gap-2 w-full'>
                        <label className='text-[15px]' htmlFor="time">Status</label>
                        <SelectStatus
                            selectStatus={selectStatus}
                            currentStatus={editedTask?.status ?? ""}
                        />
                    </div>
                </div>

                <button
                    className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] cursor-pointer hover:bg-white/10'
                    type='submit'
                >
                    Edit Task
                </button>
            </form>
        </section>
    )
}

export default EditTaskDialog