import { useAppStore } from '@/store/appStore'
import { Skeleton } from "@/components/ui/skeleton"

const TaskSkeleton = () => {
    const isDark = useAppStore((state) => state.isDark)

    return (
        <Skeleton className={`flex w-full min-w-0 items-center justify-between gap-3 h-[57px] px-4 ${isDark ? "bg-white/4" : "bg-[#f5f5f5]"}`}>
            <div className="flex min-w-0 items-center gap-2">
                <Skeleton className={`size-[18px] shrink-0 rounded-full ${isDark ? "bg-white/8" : "bg-black/8"}`} />
                <Skeleton className={`h-[14px] w-[min(200px,35vw)] rounded-xl ${isDark ? "bg-white/8" : "bg-black/8"}`} />
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <Skeleton className={`h-[14px] w-[64px] rounded-xl ${isDark ? "bg-white/8" : "bg-black/8"}`} />
                <Skeleton className={`h-[14px] w-[72px] rounded-xl ${isDark ? "bg-white/8" : "bg-black/8"}`} />
                <Skeleton className={`size-[18px] rounded-full ${isDark ? "bg-white/8" : "bg-black/8"}`} />
            </div>
        </Skeleton>
    )
}

export default TaskSkeleton