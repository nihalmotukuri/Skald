import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import type { RootState } from '@/redux/store'
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

  const onTaskListDelete = (e, taskList: string) => {
    e.stopPropagation()

    removeTaskListInTask()
    removeTaskListInUser()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex justify-between items-center text-[14px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
          {selectedTaskList || "All Tasks"}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-white/10 backdrop-blur-[8px] text-white border border-white/20 absolute z-10 right-[-120px]"
        align="start"
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
                onClick={(e) => onTaskListDelete}
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
