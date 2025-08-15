import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineArrowDownward, MdOutlineArrowForward, MdOutlineArrowUpward } from "react-icons/md";
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

interface Props {
  selectPriority: (priority: string) => void;
  currentPriority: string | undefined;
}

const SelectPriority = ({ selectPriority, currentPriority }: Props) => {
  const [selectedPriority, setSelectedPriority] = useState("");
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const onSelectPriority = (priority: string) => {
    selectPriority(priority);
    setSelectedPriority(priority);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-neutral-100/20 !border-black/30 hover:bg-neutral-200"} backdrop-blur-md border rounded-md text-[12px] px-[12px] w-[84px] py-[6px] cursor-pointer`}>
          {/* This logic correctly displays the priority */}
          {currentPriority || selectedPriority || 'Set Priority'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100/10 !border-black/20 text-gray-600"} backdrop-blur-[8px] border border-white/20 absolute z-1000 right-[-66px]`}
       align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onSelectPriority('Low')}
            className={`${isDark ? "hover:bg-white hover:text-black" : "hover:bg-black/10"} cursor-pointer`}
            >
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowDownward className="text-[20px] mt-[2px] mr-[6px]" /> Low
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSelectPriority('Medium')}
            className="hover:bg-white hover:text-black cursor-pointer"\>
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowForward className="text-[20px] mt-[2px] mr-[6px]" /> Medium
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSelectPriority('High')}
            className="hover:bg-white hover:text-black cursor-pointer">
            <p className="text-[14px] font-medium flex items-center">
              <MdOutlineArrowUpward className="text-[20px] mt-[2px] mr-[6px]" /> High
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SelectPriority;