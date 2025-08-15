import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  selectStatus: (status: string) => void;
  currentStatus: string | undefined;
}

const SelectStatus = ({ selectStatus, currentStatus }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const onSelectStatus = (status: string) => {
    selectStatus(status);
    setSelectedStatus(status);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-neutral-100/20 !border-black/30 hover:bg-neutral-200"} backdrop-blur-md border rounded-md text-[12px] px-[12px] py-[6px] w-full cursor-pointer`}>
          {currentStatus || selectedStatus || 'Set Status'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100/10 !border-black/20 text-gray-600"} backdrop-blur-[8px] border border-white/20 absolute z-1000 right-[-66px]`} align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onSelectStatus('Pending')}
            className="hover:bg-white hover:text-black cursor-pointer"
            >
            <p className="text-[14px] font-medium flex items-center">Pending</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSelectStatus('In Progress')}
            className="hover:bg-white hover:text-black cursor-pointer">
            <p className="text-[14px] font-medium flex items-center">In Progress</p>
          </DropdownMenuItem>
          {currentStatus
            ? (
              <>
                <DropdownMenuItem
                  onClick={() => onSelectStatus('Done')}
                  className="hover:bg-white hover:text-black cursor-pointer">
                  <p className="text-[14px] font-medium flex items-center">Done</p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSelectStatus('Cancelled')}
                  className="hover:bg-white hover:text-black cursor-pointer">
                  <p className="text-[14px] font-medium flex items-center">Cancelled</p>
                </DropdownMenuItem>
              </>
            ) : null
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SelectStatus;