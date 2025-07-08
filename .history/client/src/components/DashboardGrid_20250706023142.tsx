import { useSelector, useDispatch } from 'react-redux'
import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import TaskCompletionChart from "./TaskCompletionChart"
import PomodoroTimer from "./PomodoroTimer"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'
import Heatmap from './Heatmap'
import OnboardingTasks from './OnboardingTasks'

const DashboardGrid = () => {
    const dispatch = useDispatch()

    interface RootState {
        themeStore: {
            value: boolean;
        };
    }

    const darkTheme = useSelector((store: RootState) => store.themeStore.value)

    return (
        <>

            <div className="w-full mt-[18px] grid grid-cols-3 gap-4 auto-rows-[330px]">
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

            <div className='h-full w-full mt-[16px] flex-1 grid grid-cols-3 gap-4 auto-rows-fr'>
                <div className='col-span-2 row-span-1'>
                    <Heatmap />
                </div>

                <div className='col-span-1 row-span-1'>
                    <OnboardingTasks />
                </div>
            </div>
        </>
    )
}

export default DashboardGrid