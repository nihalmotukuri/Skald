import { useSelector, useDispatch } from 'react-redux' 
import React, { useState } from 'react'
import type { AppDispatch, RootState } from '@/redux/store'
import { removeTaskListInTask } from '@/redux/tasksThunks'
import { removeTaskListInUser } from '@/redux/userThunks'
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
  const { user } = useSelector((store: RootState) => store.userStore)
  const [onHover, setOnHover] = useState<OnHover>({
    display: false,
    index: null
  })
  const dispatch = useDispatch<AppDispatch>()
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const onTaskListDelete = (e: React.MouseEvent, taskList: string) => {
    e.stopPropagation()

    dispatch(removeTaskListInTask(taskList))
    dispatch(removeTaskListInUser(taskList))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex justify-between items-center text-[14px] w-[112px] ${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-black/20 text-gray-600"} backdrop-blur-md border rounded-md px-[12px] py-[6px] cursor-pointer`}>
          <span className='m-auto'>{selectedTaskList || "All Tasks"}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`${isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-black/20 text-gray-600"} backdrop-blur-[8px]  border border-white/20 absolute z-10 right-[-136px] w-[160px]"
        align="start`}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setSelectedTaskList("All Tasks")}
            className="hover:bg-white hover:text-black cursor-pointer"
          >
            <p className="text-[14px] font-medium flex items-center">
              All Tasks
            </p>
          </DropdownMenuItem>

          {user?.taskList?.map((tL: string, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => setSelectedTaskList(tL)}
              className="hover:bg-white hover:text-black cursor-pointer relative"
              onMouseEnter={() => { 
                setOnHover({display: true, index: index})
              }}
              onMouseLeave={() => { 
                setOnHover({display: false, index: null})
              }}
            >
              <p className="text-[14px] font-medium flex items-center">
                {tL}
              </p>

              <div 
                className={`absolute right-0 top-0 p-2 rounded-2xl hover:bg-[0f111a] ${onHover.display && onHover.index === index ? null : 'hidden'}`}
                onClick={(e) => onTaskListDelete(e, tL)}
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
