import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Skeleton } from "./ui/skeleton"

const DashboardSkeleton = () => {
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    return (
        <>
            <div className='col-span-2'>
                <div className='w-full h-[340px] grid grid-cols-[repeat(2,1fr)] gap-5 mb-5'>
                    <div className='grid grid-cols-[repeat(2,1fr)] grid-rows-[repeat(9,1fr)] gap-3'>
                        <Skeleton className={`col-1 row-span-5 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end`}>
                            <div>
                                <Skeleton className={`h-[20px] w-[100px] ${isDark ? "bg-white/10" : "bg-black/10"} rounded-xl`} />
                                <Skeleton className={`h-[16px] w-[60px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-xl mt-2`} />
                            </div>
                        </Skeleton>

                        <Skeleton className={`col-1 row-span-4 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end`}>
                            <div>
                                <Skeleton className={`h-[20px] w-[100px] ${isDark ? "bg-white/10" : "bg-black/10"} rounded-xl`} />
                                <Skeleton className={`h-[16px] w-[60px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-xl mt-2`} />
                            </div>
                        </Skeleton>

                        <Skeleton className={`col-2 row-start-1 row-end-5 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end`}>
                            <div>
                                <Skeleton className={`h-[20px] w-[100px] ${isDark ? "bg-white/10" : "bg-black/10"} rounded-xl`} />
                                <Skeleton className={`h-[16px] w-[60px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-xl mt-2`} />
                            </div>
                        </Skeleton>

                        <Skeleton className={`col-2 row-start-5 row-end-10 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end`}>
                            <div>
                                <Skeleton className={`h-[20px] w-[100px] ${isDark ? "bg-white/10" : "bg-black/10"} rounded-xl`} />
                                <Skeleton className={`h-[16px] w-[60px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-xl mt-2`} />
                            </div>
                        </Skeleton>
                    </div>

                    <Skeleton className={`row-span-1 col-span-1 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} flex flex-col items-center p-[24px]`}>
                        <Skeleton className={`h-[30px] w-[200px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-xl`} />
                        <Skeleton className={`rounded-[120px] size-[220px] mt-[24px] ${isDark ? "bg-white/4" : "bg-black/4"} flex justify-center items-center relative`}>
                            <Skeleton className={`rounded-[100px] size-[190px] absolute top-[15px] left-[15px] ${isDark ? "bg-[#14161e]" : "bg-black/4"}`}>

                            </Skeleton>
                        </Skeleton>
                    </Skeleton>
                </div>

                <Skeleton
                    className={`relative ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} p-[20px] mb-5 cursor-pointer`}
                >
                    <Skeleton className={`w-[260px] h-[24px] rounded-xl mb-2 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                    <Skeleton className={`w-full h-[16px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-md mb-2`} />
                    <Skeleton className={`w-[60%] h-[16px] ${isDark ? "bg-white/6" : "bg-black/6"} rounded-md`} />
                    <Skeleton className={`h-[80px] w-[120px] mt-3 rounded-xl ${isDark ? "bg-white/6" : "bg-black/6"}`} />
                    <Skeleton className={`absolute bottom-5 right-5 ${isDark ? "bg-white/6" : "bg-black/6"} w-[100px] h-[20px] rounded-lg`} />
                </Skeleton>
            </div>

            <div className='col-span-1'>
                <Skeleton className={`${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} rounded-2xl h-[210px] w-full p-[24px] mb-6`}>
                    <div className="flex items-center justify-center mt-2 mb-6">
                        <Skeleton className={`h-[24px] w-[200px] rounded-xl ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                    </div>

                    <Skeleton className={`w-full h-[100px] ${isDark ? "bg-white/4" : "bg-black/4"} rounded-xl`} />
                </Skeleton>

                <Skeleton className={`mt-5 ${isDark ? "bg-white/2" : "bg-[#f5f5f5]"} rounded-2xl py-[20px] px-[26px]`}>
                    <Skeleton className=mb-[16px] h-[24px] w-[150px] rounded-xl bg-white/10' />

                    <ul className='flex flex-col gap-2'>
                        <Skeleton className={`h-[78px] w-full rounded-lg ${isDark ? "bg-white/2" : "bg-black/4"} p-3 py-4`}>
                            <Skeleton className={`${isDark ? "bg-white/10" : "bg-black/10"} h-[18px] w-[100px] rounded-md mb-4`} />

                            <div className='flex justify-between'>
                                <Skeleton className='h-[12px] w-[60px] bg-white/6' />
                                <Skeleton className='h-[12px] w-[80px] bg-white/6' />
                            </div>
                        </Skeleton>
                        <Skeleton className='h-[78px] w-full rounded-lg bg-white/2 p-3 py-4'>
                            <Skeleton className='bg-white/10 h-[18px] w-[100px] rounded-md mb-4' />

                            <div className='flex justify-between'>
                                <Skeleton className='h-[12px] w-[60px] bg-white/6' />
                                <Skeleton className='h-[12px] w-[80px] bg-white/6' />
                            </div>
                        </Skeleton>
                        <Skeleton className='h-[78px] w-full rounded-lg bg-white/2 p-3 py-4'>
                            <Skeleton className='bg-white/10 h-[18px] w-[100px] rounded-md mb-4' />

                            <div className='flex justify-between'>
                                <Skeleton className='h-[12px] w-[60px] bg-white/6' />
                                <Skeleton className='h-[12px] w-[80px] bg-white/6' />
                            </div>
                        </Skeleton>
                    </ul>
                </Skeleton>
            </div>
        </>
    )
}

export default DashboardSkeleton