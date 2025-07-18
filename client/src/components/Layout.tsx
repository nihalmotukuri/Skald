import { useSelector, useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'
import Sidebar from './Sidebar'

const DashboardGrid = () => {
    const dispatch = useDispatch()

    interface DarkThemeState {
        themeStore: {
            value: boolean;
        };
    }

    interface BreadcrumbState {
        breadcrumbStore: {
            value: string;
        };
    }

    const darkTheme = useSelector((store: DarkThemeState) => store.themeStore.value)

    const breadcrumb = useSelector((store: BreadcrumbState) => store.breadcrumbStore.value)

    return (
        <>
            <main className="bg-[#0f111a] flex p-[24px] gap-[24px] h-screen">
                <Sidebar />

                <div className="flex-1 h-full w-full grid grid-cols-1 grid-rows-[60px_1fr] gap-0">
                    <div className="w-full row-span-1 col-span-1 flex justify-between items-center">
                        <div className='h-[60px] flex items-center'>
                            <BsLayoutSidebarInset
                                className="text-[24px] cursor-pointer"
                                onClick={() => dispatch(toggleSidebar())} />

                            <span className="mx-[22px] h-[24px] w-[1px] bg-[#45454d]"></span>

                            <p className="text-[18px] pb-[4px] text-gray-400 flex items-center">
                                Sourish's Skald
                                <MdArrowForwardIos className="mx-[12px] text-[18px] mt-[4px]" />
                                <span className="text-white">{breadcrumb}</span>
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

                    <Outlet />
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