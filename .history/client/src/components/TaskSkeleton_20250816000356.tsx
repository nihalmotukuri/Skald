import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Skeleton } from "@/components/ui/skeleton"

const TaskSkeleton = () => {
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    return (
        <Skeleton className={flex w-ful justify-between h-[57px] p-4 bg-white/4">
            <div className="flex">
                <Skeleton className="h-full w-[26px] mr-[8px] rounded-xl bg-white/8" />
                <Skeleton className="h-full w-[200px] rounded-xl bg-white/8" />
            </div>
            <div className="flex gap-[38px]">
                <Skeleton className="h-full w-[120px] mr-[12px] rounded-xl bg-white/8" />
                <Skeleton className="h-full w-[110px] rounded-xl bg-white/8" />
                <Skeleton className="h-full w-[26px] mr-[8px] rounded-xl bg-white/8" />
            </div>
        </Skeleton>
    )
}

export default TaskSkeleton