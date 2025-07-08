import { useDispatch } from 'react-redux'
import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import TaskCompletionChart from "./TaskCompletionChart"
import PomodoroTimer from "./PomodoroTimer"
import { toggleSibebar } from '@/redux/sidebarSlice'

const DashboardGrid = () => {
    const dispatch = useDispatch()

    return (
        <div className="flex-1 my-[24px] mr-[24px] flex flex-col">
            <div
                className="w-full h-[60px] flex items-center"
            >
                <div>

                </div>
            </div>

            <div className="w-full mt-[18px] flex-1 grid grid-cols-3 grid-rows-2 gap-3">
                <div className="row-span-1 col-span-1">
                    <TaskCompletionChart />
                </div>

                <div className="row-span-1 col-span-1">
                    <PomodoroTimer />
                </div>

                <div className="row-span-1 col-span-1">
                    <ClockWidget />
                </div>
            </div>
        </div>
    )
}

export default DashboardGrid