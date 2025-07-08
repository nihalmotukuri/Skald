import { useSelector, useDispatch } from 'react-redux'
import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import TaskCompletionChart from "./TaskCompletionChart"
import PomodoroTimer from "./PomodoroTimer"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar  } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'


const DashboardGrid = () => {
    const dispatch = useDispatch()

    interface RootState {
        themeStore: {
            darkTheme: boolean;
        };
    }

    const darkTheme = useSelector((store: RootState) => store.themeStore.darkTheme)

    return (
        <div className="flex-1 my-[24px] mr-[24px] flex flex-col">
            <div className="w-full flex justify-between items-center">
                <div className='h-[60px] flex items-center'>
                    <BsLayoutSidebarInset
                        className="text-[24px] cursor-pointer"
                        onClick={() => dispatch(toggleSidebar())} />

                    <span className="mx-[22px] h-[24px] w-[1px] bg-[#45454d]"></span>

                    <p className="text-[20px] pb-[4px] text-gray-400 flex items-center">
                        Sourish's Skald
                        <MdArrowForwardIos className="mx-[12px] text-[18px] mt-[4px]" />
                        <span className="text-white">Dashboard</span>
                    </p>
                </div>

                <div>
                    {darkTheme
                        ? <CiLight 
                            className='text-[24px] cursor-pointer'
                            onClick={() => dispatch(toggleTheme())} />
                        : <CiDark 
                        className='text-[24px] cursor-pointer'
                        onClick={() => dispatch(toggleTheme()) />
                    }
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