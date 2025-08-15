import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { Outlet } from 'react-router-dom'
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'
import Sidebar from './Sidebar'
import { LineWobble } from 'ldrs/react'
import 'ldrs/react/LineWobble.css'

const DashboardGrid = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user, loading } = useSelector((store: RootState) => store.userStore)
    const { isDark } = useSelector((store: RootState) => store.themeStore)
    const breadcrumb = useSelector((store: RootState) => store.breadcrumbStore.value)

    return (
        <>
            <main
                className={`${isDark ? "bg-[#0f111a]" : "bg-[fff] !text-[#2d3748]"} flex p-[24px] gap-[24px] h-screen relative`}
            >
                {loading
                    ? (
                        <div className='bg-white/2 backdrop-blur-sm absolute top-0 left-0 z-1 size-full flex justify-center items-center'>
                            <LineWobble
                                size="80"
                                stroke="5"
                                bgOpacity="0.1"
                                speed="1.75"
                                color="#a3b4ff"
                            />
                        </div>
                    )
                    : user ? (
                        <>
                            <Sidebar user={user} />

                            <div className="flex-1 h-full w-full grid grid-cols-1 grid-rows-[60px_1fr] gap-0">
                                <div className="w-full row-span-1 col-span-1 flex justify-between items-center">
                                    <div className='h-[60px] flex items-center'>
                                        <BsLayoutSidebarInset
                                            className="text-[24px] cursor-pointer"
                                            onClick={() => dispatch(toggleSidebar())} />

                                        <span className="mx-[22px] h-[24px] w-[1px] bg-[#45454d]"></span>

                                        <p className={`text-[18px] pb-[4px] ${isDark ? "text-gray-400" : "text-blue-950/60"} flex items-center`}>
                                            {user?.displayName?.split(' ')[0]}'s Skald
                                            <MdArrowForwardIos className="mx-[12px] text-[18px] mt-[4px]" />
                                            <span className={`${isDark ? "text-white" : "text-black/80"}`}>{breadcrumb}</span>
                                        </p>
                                    </div>

                                    <div className={`${isDark ? "hover:bg-white/20  " : "hover:bg-[#eae5f7]"} p-1 rounded-2xl`}>
                                        {isDark
                                            ? <CiLight
                                                className='text-[22px] cursor-pointer'
                                                onClick={() => dispatch(toggleTheme())} />
                                            : <CiDark
                                                className='text-[24px] cursor-pointer'
                                                onClick={() => dispatch(toggleTheme())} />
                                        }
                                    </div>
                                </div>

                                <Outlet />
                            </div>
                        </>
                    ) : null
                }
            </main>
        </>
    )
}

export default DashboardGrid