import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown } from "react-icons/hi2"

const Task = () => {
    return (
        <li className="flex flex-col items-start justify-between bg-white/2 backdrop-blur-md border border-white/6 rounded-md shadow-lg py-3 px-4">
            <div className="w-full flex items-start gap-4">
                <Checkbox
                    className="mt-[4px] cursor-pointer"
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="w-full grid grid-cols-[1fr_140px_140px_18px]">
                    <p className="text-[14px] font-medium text-white">{task.title}</p>
                    <p className="text-[14px] font-medium text-white">{task.status}</p>
                    <p className="text-[14px] font-medium text-white">{task.priority}</p>
                    <HiChevronDown
                        className="text-[18px] cursor-pointer"
                        onClick={() => setOpenTask(prev => !prev)}
                    />
                </div>
            </div>

            <div className={`w-full h-[40px] ${openTask ? "block" : "hidden"}`}>
            </div>
        </li>
    )
}

export default Task