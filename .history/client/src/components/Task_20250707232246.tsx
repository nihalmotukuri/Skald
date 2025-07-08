import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2"
import { ImStopwatch } from "react-icons/im"
import { SiTicktick } from "react-icons/si"
import { MdOutlinePending } from "react-icons/md"
import { AiOutlineDelete } from "react-icons/ai"
import { FiEdit2 } from "react-icons/fi"

type TaskProps = {
    task: {
        id: number;
        title: string;
        description: string;
        status: string;
        priority: string;
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
                        <MdOutlinePending className="mr-[6px] text-[18px]" /> To Do
                    </p>
                )            
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
                <div className="w-full grid grid-cols-[1fr_160px_140px_18px]">
                    <p className="text-[16px] font-medium text-white">{task.title}<span className="ml-[12px] text-[12px] py-[3px] px-[6px] rounded-sm text-gray-400 border border-white/20">Project</span></p>
                    {taskStatus()}
                    <p className="text-[14px] font-medium text-white">{task.priority}</p>
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
                </div>
            </div>

            <div className={`w-full mt-[14px] grid grid-cols-[1fr_300px]">
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