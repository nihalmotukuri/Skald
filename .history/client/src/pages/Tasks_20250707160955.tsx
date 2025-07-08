import { useState } from "react";
import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

type Task = {
  id: number;
  title: string;
  due: Date;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Set up your first project board",
    due: new Date("2025-07-05T10:30:00"),
    completed: false,
  },
  {
    id: 2,
    title: "Add 3 tasks to track",
    due: new Date("2025-07-06T14:00:00"),
    completed: false,
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <>
      <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto">
        <div className="row-span-1 col-span-1 py-[16px] flex justify-between items-center"
          style={{
            borderBottom: "1px solid #32343c"
          }}
        >
          <input
            className="w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px]  px-[12px] py-[6px]"
            type="search"
            placeholder="Filter tasks..."
          />

          <div className="flex items-center">
            <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
              <CiBoxList />
              <span className="text-[14px]">New List</span>
            </button>

            <button className="flex justify-between items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]">
              <IoAddOutline className="text-[20px]" />
              <span className="text-[14px]">Add Task</span>
            </button>
          </div>
        </div>

        <div className="row-span-1 col-span-1 overflow-y-auto">
          <ul className="pt-[24px] px-[24px] flex flex-col">
            <li className="flex items-start justify-between bg-white/1 backdrop-blur-md border border-white/5 rounded-md shadow-lg p-3">
              <div className="flex items-start gap-4">
                <Checkbox
                  className="mt-[4px] cursor-pointer"
                  checked={tasks[0].completed}
                  onCheckedChange={() => toggleTask(tasks[0].id)}
                />
                <div>
                  <p className="text-[16px] font-medium text-white pb-[8px]">{tasks[0].title}</p>
                  <p className="text-xs text-slate-400">
                    Due: {format(tasks[0].due, "PPPp")}
                  </p>
                </div>
              </div>
            </li>

            <li className="flex items-start justify-between bg-white/1 backdrop-blur-md border border-white/5 rounded-md shadow-lg p-3">
              <div className="flex items-start gap-4">
                <Checkbox
                  className="mt-[4px] cursor-pointer"
                  checked={tasks[0].completed}
                  onCheckedChange={() => toggleTask(tasks[0].id)}
                />
                <div>
                  <p className="text-[16px] font-medium text-white pb-[8px]">{tasks[0].title}</p>
                  <p className="text-xs text-slate-400">
                    Due: {format(tasks[0].due, "PPPp")}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Tasks