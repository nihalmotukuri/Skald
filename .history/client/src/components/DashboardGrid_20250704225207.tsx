// import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"

const DashboardGrid = () => {
  return (
    <div className="flex-1 my-[24px] mr-[24px]">
        <div 
            className="w-full h-[60px] pt-[24px] flex"
        >
            <BsLayoutSidebarInset className="text-[24px] cursor-pointer" />

            <span className="mx-[18px] h-[24px] w-[1px] bg-neutro"></span>

        </div>
    </div>
  )
}

export default DashboardGrid