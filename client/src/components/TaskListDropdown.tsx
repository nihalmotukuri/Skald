import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTaskLists, useTaskListMutations } from '@/queries/tasks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RxCross1 } from "react-icons/rx"

interface TaskListDropdownProps {
  selectedTaskList: string;
  setSelectedTaskList: (value: string) => void;
}

interface OnHover {
  display: boolean;
  index: number | null;
}

const TaskListDropdown = ({ selectedTaskList, setSelectedTaskList }: TaskListDropdownProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: taskLists = [], error } = useTaskLists(userId)
  const { deleteTaskList } = useTaskListMutations(userId)
  const [onHover, setOnHover] = useState<OnHover>({
    display: false,
    index: null
  })
  const isDark = useAppStore((state) => state.isDark)

  const onTaskListDelete = (e: React.MouseEvent, taskListId: string) => {
    e.stopPropagation()

    deleteTaskList.mutate(taskListId, {
      onSuccess: () => setSelectedTaskList('All Tasks')
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex justify-between items-center text-[14px] w-[112px] ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "!border-black/10 shadow-sm hover:bg-neutral-100 text-gray-600"} backdrop-blur-md border rounded-md px-[12px] py-[6px] cursor-pointer`}>
          <span className='m-auto'>{selectedTaskList || "All Tasks"}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100/10 !border-black/20 text-gray-600"} backdrop-blur-[8px]  border border-white/20 absolute z-10 right-[-136px] w-[160px]`}
        align="start"
      >
        <DropdownMenuGroup>
          {error && (
            <DropdownMenuItem disabled className="text-red-400">
              Unable to load task lists.
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setSelectedTaskList("All Tasks")}
            className={`${isDark ? "hover:bg-white hover:text-black" : "hover:bg-black/10"} cursor-pointer`}
          >
            <p className="text-[14px] font-medium flex items-center">
              All Tasks
            </p>
          </DropdownMenuItem>

          {taskLists.map((taskList, index) => (
            <DropdownMenuItem
              key={taskList.id}
              onClick={() => setSelectedTaskList(taskList.name)}
              className={`${isDark ? "hover:bg-white hover:text-black" : "hover:bg-black/10"} cursor-pointer relative`}
              onMouseEnter={() => { 
                setOnHover({display: true, index: index})
              }}
              onMouseLeave={() => { 
                setOnHover({display: false, index: null})
              }}
            >
              <p className="text-[14px] font-medium flex items-center">
                {taskList.name}
              </p>

              <div 
                className={`absolute right-0 top-0 p-2 rounded-2xl hover:bg-[0f111a] ${onHover.display && onHover.index === index ? null : 'hidden'}`}
                onClick={(e) => onTaskListDelete(e, taskList.id)}
                >
                <RxCross1 />
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TaskListDropdown
