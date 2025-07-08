import { useState } from "react";
import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"
import Task from "@/components/Task";
// import { format } from "date-fns";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskList: string;
  due: Date;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Set up your first project board",
    description: "Create your first board and add columns.",
    status: "in-progress",
    priority: "Medium",
    taskList: "Project",
    due: new Date("2025-07-08T10:30:00"),
    completed: false,
  },
  {
    id: 2,
    title: "Add 3 tasks to track",
    description: "Start tracking your to-dos here.",
    status: "done",
    priority: "High",
    taskList: "Project",
    due: new Date("2025-07-05T14:00:00"),
    completed: true,
  },
  {
    id: 3,
    title: "Design login page UI",
    description: "Create the login form with proper validation.",
    status: "pending",
    priority: "High",
    taskList: "Design",
    due: new Date("2025-07-10T16:00:00"),
    completed: false,
  },
  {
    id: 4,
    title: "Write API for task creation",
    description: "Use FastAPI to handle POST requests.",
    status: "to-do",
    priority: "High",
    taskList: "Backend",
    due: new Date("2025-07-11T12:00:00"),
    completed: false,
  },
  {
    id: 5,
    title: "Fix dark mode toggle bug",
    description: "UI glitch on mobile devices.",
    status: "in-progress",
    priority: "Low",
    taskList: "Bug Fixes",
    due: new Date("2025-07-09T18:00:00"),
    completed: false,
  },
  {
    id: 6,
    title: "Update README file",
    description: "Add setup instructions and badges.",
    status: "done",
    priority: "Low",
    taskList: "Documentation",
    due: new Date("2025-07-06T09:00:00"),
    completed: true,
  },
  {
    id: 7,
    title: "Add unit tests for auth module",
    description: "Cover login/signup logic with tests.",
    status: "pending",
    priority: "Medium",
    taskList: "Testing",
    due: new Date("2025-07-12T15:30:00"),
    completed: false,
  },
  {
    id: 8,
    title: "Deploy preview version to Vercel",
    description: "Deploy and share the staging link.",
    status: "to-do",
    priority: "Medium",
    taskList: "DevOps",
    due: new Date("2025-07-13T11:00:00"),
    completed: false,
  },
  {
    id: 9,
    title: "Create onboarding checklist",
    description: "Include key first-day tasks.",
    status: "blocked",
    priority: "Medium",
    taskList: "Operations",
    due: new Date("2025-07-14T10:00:00"),
    completed: false,
  },
  {
    id: 10,
    title: "Refactor task card component",
    description: "Use reusable components and Tailwind classes.",
    status: "in-review",
    priority: "High",
    taskList: "Frontend",
    due: new Date("2025-07-10T17:00:00"),
    completed: false,
  },
  {
    id: 9,
    title: "Create onboarding checklist",
    description: "Include key first-day tasks.",
    status: "blocked",
    priority: "Medium",
    taskList: "Operations",
    due: new Date("2025-07-14T10:00:00"),
    completed: false,
  },
  {
    id: 10,
    title: "Refactor task card component",
    description: "Use reusable components and Tailwind classes.",
    status: "in-review",
    priority: "High",
    taskList: "Frontend",
    due: new Date("2025-07-10T17:00:00"),
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
    )
  }

  return (
    <>
      <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[108px_1fr] overflow-y-auto">
        <div
          className="row-span-1 col-span-1"
        >
          <div
            className="py-[16px] flex justify-between items-center px-[2px]"
            style={{
              borderBottom: "1px solid #32343c"
            }}
          >
            <input
              className="w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]"
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

          <div className="w-full pr-[50px] pl-[64px] py-[16px] grid grid-cols-[1fr_160px_140px] text-[14px]">
            <p>Title</p>
            <p>Status</p>
            <p>Priority</p>
          </div>
        </div>

        <div className="row-span-1 col-span-1 overflow-y-auto relative pt-[14px] px-[16px]">
          <ul className=" flex flex-col gap-2">
            {tasks.map(task => (
              <Task key={task.id} task={task} toggleTask={toggleTask} />
            ))}
          </ul>

          <div className="absolute bg-black h-[60px] w-full bottom-0 left-0 z-1"
          ></div>
        </div>
      </div>
    </>
  )
}

export default Tasks