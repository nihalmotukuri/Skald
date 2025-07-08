// import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"

const DashboardGrid = () => {
  return (
    <div className="flex-1 my-[24px] mr-[24px]">
        <div 
            className="w-full h-[60px] flex items-center"
        >
            <BsLayoutSidebarInset className="text-[24px] cursor-pointer" />

            <span className="mx-[22px] h-[24px] w-[1px] bg-[#45454d]"></span>

            <p className="text-[20px] pb-[4px] text-gray-400">Sourish's Skald 
                <span className="mx-[12px] text-[24px]">{'>'}</span> 
                <span></span>
            </p>

        </div>
    </div>
  )
}

export default DashboardGrid