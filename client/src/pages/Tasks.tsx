import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"
import Task from "@/components/Task";
import { setBreadcrumb } from "@/redux/breadcrumbSlice";
import AddTaskDialog from "@/components/AddTaskDialog";
import TaskSkeleton from "../components/TaskSkeleton.tsx"
import EditTaskDialog from "@/components/EditTaskDialog.tsx";
// import { format } from "date-fns";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskList: string;
  date: string;
  time: string;
  completed: boolean;
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [displayAddTask, setDisplayAddTask] = useState<boolean>(false)
  const [displayTaskSkeleton, setDisplayTaskSkeleton] = useState<boolean>(false)
  const [displayEditTask, setDisplayEditTask] = useState<boolean>(false)
  const [editTaskId, setEditTaskId] = useState<string>('')
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("To-do List"))
  }, [dispatch])

  useEffect(() => {
    setDisplayTaskSkeleton(true)

    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks/nihal")
        const data = await res.json()
        // const initialTasks = data.map((t: Task) => (
        //   {
        //     _id: t._id,
        //     title: t.title,
        //     description: t.description,
        //     status: t.status,
        //     priority: t.priority,
        //     taskList: t.taskList,
        //     dueDate: t.dueDate,
        //     completed: t.completed
        //   }
        // ))
        setTasks(data)
        console.log(data)
      } catch (err) {
        console.error(err)
      } finally {
        setDisplayTaskSkeleton(false)
      }
    }

    fetchTasks()
  }, [])

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[108px_1fr] overflow-y-auto relative">
      {displayAddTask
        ? (
          <AddTaskDialog
            setTasks={setTasks}
            setDisplayAddTask={setDisplayAddTask}
          />
        ) : null
      }

      {displayEditTask
        ? (
          <EditTaskDialog
            setTasks={setTasks}
            setDisplayEditTask={setDisplayEditTask}
            taskToEdit={tasks.find(t => t._id === editTaskId)}
          />
        ) : null
      }

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
            <button
              className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer"
            >
              <CiBoxList />
              <span className="text-[14px]">New List</span>
            </button>

            <button
              className="flex justify-between items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]"
              onClick={() => setDisplayAddTask(true)}
            >
              <IoAddOutline className="text-[20px]" />
              <span className="text-[14px]">Add Task</span>
            </button>
          </div>
        </div>

        <div className="w-full pr-[62px] pl-[64px] py-[16px] grid grid-cols-[1fr_160px_140px] text-[14px]">
          <p>Title</p>
          <p>Status</p>
          <p>Priority</p>
        </div>
      </div>

      <div className="row-span-1 col-span-1 overflow-y-auto relative">
        <ul className="pt-[14px] pb-[54px] px-[16px] flex flex-col gap-2">
          {displayTaskSkeleton
            ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TaskSkeleton key={index} />
              ))
            )
            : (
              tasks.map(task => (
                <Task
                  key={task._id}
                  task={task}
                  toggleTask={toggleTask}
                  setDisplayEditTask={setDisplayEditTask}
                  setEditTaskId={setEditTaskId}
                />
              )
              ))}
        </ul>
      </div>

      <div
        className="absolute bg-black h-[80px] w-full bottom-0 left-0 z-1"
        style={{
          background: "linear-gradient(to bottom, transparent, #0f111a)"
        }}
      ></div>
    </div>
  )
}

export default Tasks