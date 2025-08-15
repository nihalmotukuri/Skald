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
      <DropdownMenuContent className="bg-white/10 backdrop-blur-[8px] text-white border border-white/20 absolute right-[-66px] z-1000">
        <DropdownMenuGroup>
          {user?.taskList?.length ?? 0 > 0
            ? (
              user?.taskList.map((tL: string, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectTaskList(tL)}
                  className="hover:bg-white hover:text-black cursor-pointer">
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
