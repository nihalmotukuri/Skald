import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2"
import { ImStopwatch, ImBlocked } from "react-icons/im"
import { SiTicktick } from "react-icons/si"
import { MdOutlinePending } from "react-icons/md"
import { MdOutlineArrowDownward, MdOutlineArrowForward, MdOutlineArrowUpward } from "react-icons/md"
// import TaskDropdown from './TaskDropdown'
// import { format } from "date-fns"
import { Calendar } from "lucide-react"

type TaskProps = {
    task: {
        _id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        taskList: string;
        date: string;
        time: string;
        completed: boolean;
    },
    toggleTask: (id: string) => void
}

const Task = ({ task, toggleTask, setDisplayEditTask, setEditTaskId, setTaskToEdit }: TaskProps) => {
    const [openTask, setOpenTask] = useState(false)

    const taskStatus = () => {
        switch (task.status) {
            case "Done":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <SiTicktick className="mr-[8px] text-[18px]" /> Done
                    </p>
                );
            case "In-progress":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <ImStopwatch className="mr-[6px] text-[18px]" /> In Progress
                    </p>
                );
            case "Pending":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <MdOutlinePending className="mr-[6px] text-[18px]" /> To do
                    </p>
                );
            case "Blocked":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <ImBlocked className="mr-[6px] text-[16px]" /> Blocked
                    </p>
                );
        }
    }

    const taskPriority = () => {
        switch (task.priority) {
            case "Low":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <MdOutlineArrowDownward className="text-[20px] mt-[2px] mr-[6px]" /> Low
                    </p>
                );
            case "Medium":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <MdOutlineArrowForward className="text-[20px] mt-[2px] mr-[6px]" /> Medium
                    </p>
                );
            case "High":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <MdOutlineArrowUpward className="text-[20px] mt-[2px] mr-[6px]" /> High
                    </p>
                );
        }
    }

    const onEditTask = () => {
        setDisplayEditTask(true)
        setEditTaskId(task._id)
    }

    const onDeleteTask = (taskId: string) => {
        const deleteTask = async () => {
            const options = {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json'
                }
            }

            try {
                const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, options)
                const data = await res.json()
                console.log(data)
            } catch (err) {
                console.error(err)
            }
        }

        deleteTask()
    }

    return (
        <li className="flex flex-col items-start justify-between bg-white/2 backdrop-blur-md border border-white/6 rounded-md shadow-lg p-4 overflow-hidden">
            <div className="w-full flex items-center gap-4">
                <Checkbox
                    className="mt-[4px] cursor-pointer"
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task._id)}
                />
                <div className="w-full grid grid-cols-[1fr_160px_140px_30px] items-center">
                    <p className="text-[16px] font-medium text-white">
                        {task.title}
                        {task.taskList
                            ? (
                                <span className="ml-[12px] text-[12px] py-[3px] px-[6px] rounded-sm text-gray-400 border border-white/20">{task.taskList}</span>
                            )
                            : ""
                        }
                    </p>
                    {taskStatus()}
                    {taskPriority()}
                    {openTask
                        ? <HiChevronUp
                            className="text-[18px] cursor-pointer"
                            onClick={() => setOpenTask(prev => !prev)}
                        />
                        : <HiChevronDown
                            className="text-[18px] cursor-pointer"
                            onClick={() => setOpenTask(prev => !prev)}
                        />
                    }
                    {/* <TaskDropdown /> */}
                </div>
            </div>

            <div className={`w-full mt-[14px] mr-[300px] ${openTask ? "flex" : "hidden"} justify-between`}>
                <div>
                    <p className="text-slate-400 text-[14px] ml-[32px]">{task.description}</p>

                    <p className="flex items-center gap-1 text-[12px] text-white/50 ml-8 mt-2">
                        <Calendar className="size-4 text-slate-400" />
                        <span>Due: {task.date}, {task.time}</span>
                    </p>
                </div>
                <div className="flex items-end px-[14px]">
                    <button 
                        onClick={onEditTask}
                        className="text-[14px] text-slate-500 hover:text-[#14161e] border border-slate-500 px-[18px] py-[1px] hover:bg-slate-500 rounded-xl cursor-pointer mr-[16px]"
                    >Edit</button>
                    <button
                        onClick={() => onDeleteTask(task._id)}
                        className="text-[14px] px-[16px] py-[2px] text-red-500 hover:bg-red-200 rounded-xl border border-red-900 cursor-pointer"
                    >Delete</button>
                </div>
            </div>
        </li>
    )
}

export default Task