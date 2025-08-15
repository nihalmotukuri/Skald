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
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const onSelectTaskList = (taskList: string) => {
    setSelectedTaskList(taskList)
    selectTaskList(taskList)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-neutral-100/20 !border-black/30 hover:bg-neutral-200"} backdrop-blur-md border rounded-md text-[12px] px-[12px] py-[6px] w-full cursor-pointer`}>
          {currentTaskList || selectedTaskList || "Set Task List"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100/10 !border-black/20 text-gray-600"} backdrop-blur-[8px] border border-white/20 absolute z-1000 right-[-64px]`}>
        <DropdownMenuGroup>
          {user?.taskList?.length ?? 0 > 0
            ? (
              user?.taskList.map((tL: string, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectTaskList(tL)}
            className={`${isDark ? "hover:bg-white hover:text-black" : "hover:bg-black/10"} cursor-pointer`}
                  >
                  <p className="text-[14px] font-medium flex items-center">
                    {tL}
                  </p>
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
