import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTaskLists } from '@/queries/tasks'
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
  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const { data: taskLists = [], error } = useTaskLists(userId)

  const onSelectTaskList = (taskList: string) => {
    setSelectedTaskList(taskList)
    selectTaskList(taskList)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "!border-black/10 shadow-md hover:bg-neutral-200"} backdrop-blur-md border rounded-md text-[12px] px-[12px] py-[6px] w-full cursor-pointer`}>
          {currentTaskList || selectedTaskList || "Set Task List"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100/10 !border-black/20 text-gray-600"} backdrop-blur-[8px] border border-white/20 absolute z-1000 right-[-64px]`}>
        <DropdownMenuGroup>
          {error
            ? <DropdownMenuItem disabled><p className="text-sm text-red-400">Unable to load task lists.</p></DropdownMenuItem>
            : taskLists.length > 0
            ? (
              taskLists.map((taskList) => (
                <DropdownMenuItem
                  key={taskList.id}
                  onClick={() => onSelectTaskList(taskList.name)}
            className={`${isDark ? "hover:bg-white hover:text-black" : "hover:bg-black/10"} cursor-pointer`}
                  >
                  <p className="text-[14px] font-medium flex items-center">
                    {taskList.name}
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
