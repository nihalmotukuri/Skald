import { useSelector, useDispatch } from 'react-redux'
// import { Outlet } from 'react-router-dom'
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'
import Sidebar from './Sidebar'
import TaskCompletionChart from './TaskCompletionChart'
import Heatmap from './Heatmap'
import OnboardingTasks from './OnboardingTasks'
import PomodoroTimer from './PomodoroTimer'
import ClockWidget from './ClockWidget'

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
      <main className="bg-[#0f111a] flex">
        <Sidebar />

        <div className="flex-1 my-[24px] mr-[24px] max-h-screen">
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
                            onClick={() => dispatch(toggleTheme())} />
                    }
                </div>
            </div>

            <div>
                
            </div className>
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

            <div className='h-full w-full mt-[16px] flex-1 grid grid-cols-3 gap-4'>
                <div className='col-span-2 row-span-1'>
                    <Heatmap />
                </div>

                <div className='col-span-1 row-span-1'>
                    <OnboardingTasks />
                </div>
            </div>
        </div>
      </main>
    </>

        // <div className="flex-1 my-[24px] mr-[24px] flex flex-col">
        //     <div className="w-full flex justify-between items-center">
        //         <div className='h-[60px] flex items-center'>
        //             <BsLayoutSidebarInset
        //                 className="text-[24px] cursor-pointer"
        //                 onClick={() => dispatch(toggleSidebar())} />

        //             <span className="mx-[22px] h-[24px] w-[1px] bg-[#45454d]"></span>

        //             <p className="text-[20px] pb-[4px] text-gray-400 flex items-center">
        //                 Sourish's Skald
        //                 <MdArrowForwardIos className="mx-[12px] text-[18px] mt-[4px]" />
        //                 <span className="text-white">Dashboard</span>
        //             </p>
        //         </div>

        //         <div>
        //             {darkTheme
        //                 ? <CiLight
        //                     className='text-[24px] cursor-pointer'
        //                     onClick={() => dispatch(toggleTheme())} />
        //                 : <CiDark
        //                     className='text-[24px] cursor-pointer'
        //                     onClick={() => dispatch(toggleTheme())} />
        //             }
        //         </div>
        //     </div>

        //     <Outlet />
        // </div>
    )
}

export default DashboardGrid