import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { deleteTask } from "@/redux/tasksThunks";
import { Checkbox } from "@/components/ui/checkbox";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { ImStopwatch } from "react-icons/im";
import { TbCancel } from "react-icons/tb";
import { SiTicktick } from "react-icons/si";
import { MdOutlinePending, MdOutlineArrowDownward, MdOutlineArrowForward, MdOutlineArrowUpward } from "react-icons/md";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";
import type { Task } from "@/types/task.ts";

type TaskProps = {
    task: Task;
    toggleTask: (id: string) => void;
    setDisplayEditTask: (value: boolean) => void;
    setEditTaskId: (id: string) => void;
};

const TaskItem = ({ task, toggleTask, setDisplayEditTask, setEditTaskId }: TaskProps) => {
    const [openTask, setOpenTask] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const taskStatus = () => {
        switch (task.status) {
            case "Done":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <SiTicktick className="mr-[8px] text-[18px]" /> Done
                </p>;
            case "In Progress":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <ImStopwatch className="mr-[6px] text-[18px]" /> In Progress
                </p>;
            case "Pending":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <MdOutlinePending className="mr-[6px] text-[18px]" /> To do
                </p>;
            case "Cancelled":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <TbCancel className="mr-[6px] text-[16px]" /> Cancelled
                </p>;
        }
    };

    const taskPriority = () => {
        switch (task.priority) {
            case "Low":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <MdOutlineArrowDownward className="text-[20px] mt-[2px] mr-[6px]" /> Low
                </p>;
            case "Medium":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <MdOutlineArrowForward className="text-[20px] mt-[2px] mr-[6px]" /> Medium
                </p>;
            case "High":
                return <p className={`text-[14px] font-medium ${isDark ? "text-white" : "text-[#2d3748]"} flex items-center`}>
                    <MdOutlineArrowUpward className="text-[20px] mt-[2px] mr-[6px]" /> High
                </p>;
        }
    };

    const onEditTask = () => {
        setDisplayEditTask(true);
        setEditTaskId(task._id!);
    };

    const onDeleteTask = (taskId: string) => {
        dispatch(deleteTask(taskId));
    };

    const formatDueDate = (date: string, time: string, completed: boolean) => {
        const combined = dayjs(`${date}T${time}`);
        const now = dayjs();

        if (combined.isBefore(now, "minute") && !completed) return `Overdue • ${combined.format("h:mm A")}`;
        if (combined.isSame(now, "day")) return `Due today • ${combined.format("h:mm A")}`;
        if (combined.isSame(now.add(1, "day"), "day")) return `Due tomorrow • ${combined.format("h:mm A")}`;

        return `${combined.format("DD MMM")} • ${combined.format("h:mm A")}`;
    };

    return (
        <li className={`flex flex-col items-start justify-between shadow-sm ${!task.completed ? (isDark ? "bg-white/2" : "bg-white") : (isDark ? "bg-white/6" : "bg-neutral-100")} backdrop-blur-md border rounded-md p-4 overflow-hidden ${task.status === "Cancelled" ? "opacity-50" : ""} ${formatDueDate(task.date!, task.time!, task.completed!).includes('Overdue') ? (isDark ? "border-red-900/40 !bg-red-900/4" : "border-red-700/60 !bg-red-900/10") : (isDark ? "border-white/6" : "")}`}>
            <div className="w-full flex items-center gap-4">
                <Checkbox
                    disabled={task.status === "Cancelled"}
                    className={`mt-[4px] cursor-pointer !bg-transparent ${!task.completed ? (isDark ? "!border-white" : "!border-black/40") : (isDark ? "!border-transparent" : "!border-transparent !text-black/60")}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task._id!)}
                />
                <div className="w-full grid grid-cols-[1fr_160px_140px_30px] items-center">
                    <p className={`text-[16px] ${isDark ? "text-white font-medium" : "font-semibold"}`}>
                        <span className={`${task.status === "Cancelled" ? "line-through" : ""}`}>{task.title}</span>
                        {task.taskList && (
                            <span className={`ml-[12px] text-[12px] py-[1px] px-[6px] rounded-xl ${isDark ? "text-gray-400 border-white/20" : "text-white bg-[#602bf8] border-transparent shadow-lg"} border`}>
                                {task.taskList}
                            </span>
                        )}
                    </p>
                    {taskStatus()}
                    {taskPriority()}
                    {openTask
                        ? <HiChevronUp className="text-[18px] cursor-pointer" onClick={() => setOpenTask(prev => !prev)} />
                        : <HiChevronDown className="text-[18px] cursor-pointer" onClick={() => setOpenTask(prev => !prev)} />
                    }
                </div>
            </div>

            <div className={`w-full mt-[14px] mr-[300px] ${openTask ? "flex" : "hidden"} justify-between`}>
                <div>
                    <p className={`${isDark ? "text-slate-500" : "text-[#602bf8]/2=0"} text-[14px] ml-[32px] ${task.status === "Cancelled" ? "line-through" : ""}`}>
                        {task.description}
                    </p>
                    <p className="flex items-center gap-1 text-[12px] text-white/50 ml-8 mt-2">
                        <Calendar className="size-4 text-slate-600" />
                        <span className={`${task.status === "Cancelled" ? "line-through" : ""} pl-[4px] ${formatDueDate(task.date!, task.time!, task.completed!).includes('Overdue') ? "text-red-900" : (isDark ? "" : "text-black/40")}`}>
                            {formatDueDate(task.date!, task.time!, task.completed!)}
                        </span>
                    </p>
                </div>
                <div className="flex items-end px-[14px]">
                    <button
                        onClick={onEditTask}
                        className={`text-[14px] text-slate-500 hover:text-[#14161e] border border-slate-500 px-[18px] py-[1px] ${isDark ? "hover:bg-slate-500" : "hover:bg-slate-300"} rounded-xl cursor-pointer mr-[16px]`}
                    >Edit</button>
                    <button
                        onClick={() => onDeleteTask(task._id!)}
                        className={`text-[14px] px-[16px] py-[2px] text-red-500  rounded-xl border ${isDark ? "border-red-900 hover:bg-red-200" : "border-red-600 hover:bg-red-100"} cursor-pointer`}
                    >Delete</button>
                </div>
            </div>
        </li>
    );
};

export default TaskItem;
