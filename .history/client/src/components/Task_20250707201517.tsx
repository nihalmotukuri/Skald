import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown } from "react-icons/hi2"

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

    return (
        <li className={`${openTask ? "auto" : "h-[56px]"} flex flex-col items-start justify-between bg-white/2 backdrop-blur-md border border-white/6 rounded-md shadow-lg p-4 overflow-hidden`}>
            <div className="w-full flex items-start gap-4">
                <Checkbox
                    className="mt-[4px] cursor-pointer"
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="w-full grid grid-cols-[1fr_140px_120px_18px]">
                    <p className="text-[16px] font-medium text-white">{task.title}</p>
                    <p className="text-[14px] font-medium text-white">{task.status}</p>
                    <p className="text-[14px] font-medium text-white">{task.priority}</p>
                    <HiChevronDown
                        className="text-[18px] cursor-pointer"
                        onClick={() => setOpenTask(prev => !prev)}
                    />
                </div>
            </div>

            <div className="mt-[14px]">
                <p className="text-slate-400 text-[12px]">Podhune levali, dhoddi ki povali</p>
            </div>
        </li>
    )
}

export default Task