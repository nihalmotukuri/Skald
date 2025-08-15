import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SelectTaskListProps {
  selectTaskList: (value: string) => void;
  currentTaskList: string;
}

const SelectTaskList = ({ selectTaskList, currentTaskList }: SelectTaskListProps) => {
  const [selectedTaskList, setSelectedTaskList] = useState('')
  const { user } = useSelector((store: RootState) => store.userStore)

  const onSelectTaskList = (taskList: string) => {
    setSelectedTaskList(taskList)
    selectTaskList(taskList)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="bg-white/6 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[12px] px-[12px] w-[84px] py-[6px] w-full cursor-pointer">
          {currentTaskList || selectedTaskList || "Set Task List"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white/10 backdrop-blur-[8px] text-white border border-white/20 absolute right-[-66px] z-1000">
        <DropdownMenuGroup>
          {user?.taskList?.length ?? 0 > 0
            ? (
              user?.taskList.map((tL: string, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectTaskList(tL)}
                  className="hover:bg-white hover:text-black cursor-pointer">
                  <span className="text-[14px] font-medium flex items-center">
                    {tL}
                  </span>
                  
                  <div>
                    
                  </div>
                </DropdownMenuItem>
              )))
            : (
              <DropdownMenuItem>
                <p className="text-[14px] font-medium flex items-center">
                  No tasklists available
                </p>
              </DropdownMenuItem>
            )
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SelectTaskList
