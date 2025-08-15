import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editTask } from '@/redux/tasksThunks'
import { IoAddOutline } from "react-icons/io5"
import TaskItem from "@/components/Task";
import { setBreadcrumb } from "@/redux/breadcrumbSlice.ts";
import AddTaskDialog from "@/components/AddTaskDialog";
import TaskSkeleton from "../components/TaskSkeleton.tsx"
import EditTaskDialog from "@/components/EditTaskDialog.tsx";
import type { Task } from "@/types/task.ts";
import type { AppDispatch, RootState } from "@/redux/store.ts";
import TaskListDropdown from '@/components/TaskListDropdown.tsx'
import AddTaskList from '@/components/AddTaskList.tsx'
import { RxCross1 } from "react-icons/rx"

const Tasks = () => {
  const [displayAddTask, setDisplayAddTask] = useState<boolean>(false)
  const [displayEditTask, setDisplayEditTask] = useState<boolean>(false)
  const [editTaskId, setEditTaskId] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()

  const { tasks, loading } = useSelector((store: RootState) => store.tasksStore)
  const [selectedTaskList, setSelectedTaskList] = useState('All Tasks')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [filterQuery, setFilterQuery] = useState('')
  const [debouncedFilterQuery, setDebouncedFilterQuery] = useState('')
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  useEffect(() => {
    let tempTasks = [...tasks].reverse()

    if (selectedTaskList !== 'All Tasks') {
      tempTasks = tempTasks.filter(t => t.taskList === selectedTaskList)
    }

    if (debouncedFilterQuery) {
      tempTasks = tempTasks.filter(t =>
        t.title?.trim().toLowerCase().includes(
          debouncedFilterQuery.trim().toLowerCase()
        )
      )
    }

    setFilteredTasks(tempTasks)
  }, [tasks, selectedTaskList, debouncedFilterQuery])

  useEffect(() => {
    dispatch(setBreadcrumb("To-do List"))
  }, [dispatch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterQuery(filterQuery)
    }, 500)

    return () => clearTimeout(handler)
  }, [filterQuery])

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId)
    if (task?.completed) {
      dispatch(editTask({ ...task, completed: false, completedAt: null, status: "In Progress" }))
    } else {
      dispatch(editTask({ ...task, completed: true, completedAt: new Date(), status: "Done" }))
    }
  }

  const displayTasks = () => (
    <ul className="pt-[14px] pb-[54px] px-[16px] flex flex-col gap-2">
      {loading
        ? (
          Array.from({ length: 6 }).map((_, index) => (
            <TaskSkeleton key={index} />
          )))
        : (
          filteredTasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              toggleTask={toggleTask}
              setDisplayEditTask={setDisplayEditTask}
              setEditTaskId={setEditTaskId}
            />
          )))}
    </ul>
  )

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[108px_1fr] overflow-y-auto relative">
      {displayAddTask && (
        <AddTaskDialog setDisplayAddTask={setDisplayAddTask} />
      )}

      {displayEditTask && (
        <EditTaskDialog
          setDisplayEditTask={setDisplayEditTask}
          editTaskId={editTaskId}
        />
      )}

      <div className="row-span-1 col-span-1">
        <div
          className="py-[16px] flex justify-between items-center px-[2px]"
          style={{ borderBottom: "1px solid #32343c" }}
        >
          <div className="flex items-center gap-[14px]">
            <div className="relative">
              <input
                className={`w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] pr-[32px]"
                type="text"
                placeholder="Filter tasks..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
              />

              {filterQuery && (
                <div
                  className="absolute z-1 top-[3px] right-[3px] hover:bg-white/10 p-[6px] rounded-md cursor-pointer"
                  onClick={() => setFilterQuery('')}
                >
                  <RxCross1 />
                </div>
              )}
            </div>

            <TaskListDropdown
              selectedTaskList={selectedTaskList}
              setSelectedTaskList={setSelectedTaskList}
            />
          </div>

          <div className="flex items-center gap-[14px]">
            <AddTaskList />

            <button
              className="flex justify-between items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer"
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
        {tasks.length === 0 && !loading ? (
          <div className="flex justify-center">
            <p className="text-[18px] text-gray-400 text-center mt-[54px] bg-white/6 p-4 rounded-2xl inline-block m-auto">
              You haven’t added any tasks yet. Start by creating your first one!
            </p>
          </div>
        ) : filteredTasks.length === 0 && !loading ? (
          <div className="flex justify-center">
            <p className="text-[18px] text-gray-400 text-center mt-[54px] bg-white/4 border border-white/10 p-4 rounded-2xl inline-block m-auto">
              No tasks match your search. Try adjusting your filter or keywords.
            </p>
          </div>
        ) : (
          displayTasks()
        )}
      </div>

      <div
        className="absolute bg-[#ffffff] h-[80px] w-full bottom-0 left-0 z-1"
        style={{ background: `linear-gradient(to bottom, transparent, ${isDark ? "#0f111a" : "#ffffff"})` }}
      />
    </div>
  )
}

export default Tasks
