import { useState } from 'react'
import type React from 'react'
import PriorityDropdown from './PriorityDropdown'
import { RxCross2 } from "react-icons/rx"
// import { ConeIcon } from 'lucide-react';
// import { DateTime } from './DateTime'

interface AddTaskDialogProps {
    displayAddTask: boolean;
    setDisplayAddTask: (value: boolean) => void;
}

const AddTaskDialog = ({ setTasks, setDisplayAddTask }: AddTaskDialogProps) => {
    const [addTaskData, setAddTaskData] = useState({
        title: '',
        description: '',
        status: 'Pending',
        date: '',
        time: ''
    })
    const [priority, setPriority] = useState('')

    const selectPriority = (selectedPriority: string) => {
        setPriority(selectedPriority)
    }

    const addTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(addTaskData)
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ userId: 'nihal', ...addTaskData, priority })
        }

        const postTask = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/tasks", options)
                const data = await res.json()

                if (res.ok) {
                    setAddTaskData({
                        title: '',
                        description: '',
                        status: 'Pending',
                        date: '',
                        time: ''
                    })
                    setTasks(prev => [...prev, {...addTaskData, priority}])
                    setPriority('')
                    setDisplayAddTask(false)
                }
                console.log(data)
            } catch (err) {
                console.error(err)
            }
        }

        postTask()
    }

    return (
        <section className={`fixed top-0 left-0 z-999 bg-black/40 h-full w-full flex justify-center items-center`}>
            <form
                onSubmit={addTask}
                className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-md shadow-lg p-[24px] w-[420px] flex flex-col gap-[18px] relative"
            >
                <div
                    className='absolute top-0 right-0 p-[6px] bg-white/6 hover:bg-white/10 text-red-5 cursor-pointer'
                    style={{
                        borderBottomLeftRadius: "7px",
                        borderTopRightRadius: "7px"
                    }}
                    onClick={() => setDisplayAddTask(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                        type="text"
                        name="title"
                        onChange={e => setAddTaskData({ ...addTaskData, title: e.currentTarget.value })}
                        value={addTaskData.title}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] resize-none'
                        rows={5}
                        onChange={e => setAddTaskData({ ...addTaskData, description: e.currentTarget.value })}
                        value={addTaskData.description}
                    ></textarea>
                </div>

                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="date">Date</label>
                        <input
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                            type="date"
                            name="date"
                            onChange={e => setAddTaskData({ ...addTaskData, date: e.currentTarget.value })}
                            value={addTaskData.date}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]' htmlFor="time">Time</label>
                        <input
                            className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                            type="time"
                            onChange={e => setAddTaskData({ ...addTaskData, time: e.currentTarget.value })}
                            value={addTaskData.time}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[15px]'>Priority</label>
                        <PriorityDropdown selectPriority={selectPriority} />
                    </div>
                </div>

                <button
                    className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] cursor-pointer hover:bg-white/10'
                    type='submit'>
                    Add Task
                </button>
            </form>
        </section>
    )
}

export default AddTaskDialog