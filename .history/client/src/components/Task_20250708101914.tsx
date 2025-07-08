import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2"
import { ImStopwatch, ImBlocked } from "react-icons/im"
import { SiTicktick } from "react-icons/si"
import { MdOutlinePending } from "react-icons/md"
import { AiOutlineDelete } from "react-icons/ai"
import { FiEdit2 } from "react-icons/fi"
import { MdOutlineArrowDownward, MdOutlineArrowForward, MdOutlineArrowUpward } from "react-icons/md"
import TaskDropdown from './TaskDropdown'

type TaskProps = {
    task: {
        id: number;
        title: string;
        description: string;
        status: string;
        priority: string;
        taskList: string;
        due: Date;
        completed: boolean;
    },
    toggleTask: (id: number) => void
}


const Task = ({ task, toggleTask }: TaskProps) => {
    const [openTask, setOpenTask] = useState(false)

    const taskStatus = () => {
        switch (task.status) {
            case "done":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <SiTicktick className="mr-[8px] text-[18px]" /> Done
                    </p>
                );
            case "in-progress":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <ImStopwatch className="mr-[6px] text-[18px]" /> In Progress
                    </p>
                );
            case "pending":
                return (
                    <p className="text-[14px] font-medium text-white flex items-center">
                        <MdOutlinePending className="mr-[6px] text-[18px]" /> To do
                    </p>
                );
            case "blocked":
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

    return (
        <li className="flex flex-col items-start justify-between bg-white/2 backdrop-blur-md border border-white/6 rounded-md shadow-lg p-4 overflow-hidden">
            <div className="w-full flex items-start gap-4">
                <Checkbox
                    className="mt-[4px] cursor-pointer"
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="w-full grid grid-cols-[1fr_160px_140px_30px_30px]">
                    <p className="text-[16px] font-medium text-white">{task.title}<span className="ml-[12px] text-[12px] py-[3px] px-[6px] rounded-sm text-gray-400 border border-white/20">{task.taskList}</span></p>
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
                    <TaskDropdown />
                </div>
            </div>

            <div className={`w-full mt-[14px] ${openTask ? "grid" : "hidden"} grid-cols-[1fr_300px]`}>
                <p className="text-slate-400 text-[14px] ml-[32px]">{task.description}</p>

                <div className="flex justify-end items-center gap-5 text-[18px]">
                    <FiEdit2 className="cursor-pointer" />
                    <AiOutlineDelete className="cursor-pointer" />
                </div>
            </div>
        </li>
    )
}

export default Task