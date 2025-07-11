import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { RxDotsHorizontal } from "react-icons/rx"

const TaskDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[transparent] m-0 p-0 text-[20px]">
            <RxDotsHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white/10 backdrop-blur-[8px] text-white border border-white/20" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-white hover:text-black cursor-pointer">
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem className="hover:bg-white hover:text-black cursor-pointer">Make a copy</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuItem className="text-red-500 hover:bg-red-200 cursor-pointer">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TaskDropdown