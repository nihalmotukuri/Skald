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
                                <Skeleton className={`h-[20px] w-[100px] ${"bg-white/10" : "bg-black/2"} rounded-xl`} />
                                <Skeleton className='h-[16px] w-[60px] bg-white/6 rounded-xl mt-2' />
                            </div>
                        </Skeleton>

                        <div className='col-1 row-span-4 bg-white/2 backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end'>
                            <div>
                                <Skeleton className='h-[20px] w-[100px] bg-white/10 rounded-xl' />
                                <Skeleton className='h-[16px] w-[60px] bg-white/6 rounded-xl mt-2' />
                            </div>
                        </div>

                        <div className='col-2 row-start-1 row-end-5 bg-white/2 backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end'>
                            <div>
                                <Skeleton className='h-[20px] w-[100px] bg-white/10 rounded-xl' />
                                <Skeleton className='h-[16px] w-[60px] bg-white/6 rounded-xl mt-2' />
                            </div>
                        </div>

                        <div className='col-2 row-start-5 row-end-10 bg-white/2 backdrop-blur-md rounded-xl p-[18px] flex flex-col justify-end'>
                            <div>
                                <Skeleton className='h-[20px] w-[100px] bg-white/10 rounded-xl' />
                                <Skeleton className='h-[16px] w-[60px] bg-white/6 rounded-xl mt-2' />
                            </div>
                        </div>
                    </div>

                    <Skeleton className="row-span-1 col-span-1 bg-white/2 flex flex-col items-center p-[24px]">
                        <Skeleton className='h-[30px] w-[200px] bg-white/6 rounded-xl' />
                        <Skeleton className='rounded-[120px] size-[220px] mt-[24px] bg-white/2 flex justify-center items-center'/>
                    </Skeleton>
                </div>

                <Skeleton
                    className='relative bg-white/2 p-[20px] mb-5 cursor-pointer hover:bg-white/4'
                >
                    <Skeleton className='w-[260px] h-[24px] rounded-xl mb-2 bg-white/10' />
                    <Skeleton className='w-full h-[16px] bg-white/6 rounded-md mb-2' />
                    <Skeleton className='w-[60%] h-[16px] bg-white/6 rounded-md' />
                    <Skeleton className='h-[80px] w-[120px] mt-3 rounded-xl bg-white/6' />
                    <Skeleton className='absolute bottom-5 right-5 bg-white/6 w-[100px] h-[20px] rounded-lg' />
                </Skeleton>
            </div>

            <div className='col-span-1'>
                <Skeleton className='bg-white/2 rounded-2xl h-[210px] shadow-lg w-full p-[24px] mb-6'>
                    <div className="flex items-center justify-center mt-2 mb-6">
                        <Skeleton className='h-[24px] w-[200px] rounded-xl bg-white/10' />
                    </div>

                    <Skeleton className="w-full h-[100px] bg-white/4 rounded-xl" />
                </Skeleton>

                <Skeleton className='mt-5 bg-white/2 rounded-2xl shadow-lg py-[20px] px-[26px]'>
                    <Skeleton className='mb-[16px] h-[24px] w-[150px] rounded-xl bg-white/10' />

                    <ul className='flex flex-col gap-2'>
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