import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
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

const TaskListDropdown = ({ selectedTaskList, setSelectedTaskList }: TaskListDropdownProps) => {
  const { user } = useSelector((store: RootState) => store.userStore)

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
            >
              <p className="text-[14px] font-medium flex items-center">
                {tL}
              </p>

              <div className='absolute right-[8px] top-[8px]'>
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
