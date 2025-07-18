import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MdOutlineArrowDownward, MdOutlineArrowForward, MdOutlineArrowUpward } from "react-icons/md"

const PriorityDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="bg-white/6 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[12px] px-[12px] py-[6px]">
          Set Priority
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white/10 backdrop-blur-[8px] text-white border border-white/20 absolute z-1000" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-white hover:text-black cursor-pointer">
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowDownward className="text-[20px] mt-[2px] mr-[6px]" /> Low
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-white hover:text-black cursor-pointer">
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowForward className="text-[20px] mt-[2px] mr-[6px]" /> Medium
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-white hover:text-black cursor-pointer">
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowUpward className="text-[20px] mt-[2px] mr-[6px]" /> High
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PriorityDropdown