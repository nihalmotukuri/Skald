import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Skeleton } from "@/components/ui/skeleton"

const NoteSkeleton = () => {
    const { isDark } = useSelector((store: RootState) => store.themeStore)

    return (
        <Skeleton className={`space-y-2 w-full justify-between h-[239px] py-[18px] px-[22px] ${isDark ? "bg-white/4" : "bg-[f5f5f5]"} rounded-md`}>
            <Skeleton className="h-[24px] w-[240px] mr-[8px] rounded-xl bg-white/8" />
            <Skeleton className="h-[14px] w-full rounded-xl bg-white/8" />
            <Skeleton className="h-[14px] w-[60%] rounded-xl bg-white/8" />
            <Skeleton className="h-[80px] w-[120px] rounded-xl bg-white/8" />
            <Skeleton className="h-[18px] w-[160px] mt-[18px] rounded-xl bg-white/8" />
        </Skeleton>
    )
}

export default NoteSkeleton