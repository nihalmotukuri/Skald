import { Skeleton } from "@/components/ui/skeleton"

const NoteSkeleton = () => {
    return (
        <Skeleton className="space-y-2 w-full justify-between h-[134px] py-4 px-3 bg-white/4 rounded-md">
            <Skeleton className="h-[24px] w-[240px] mr-[8px] rounded-xl bg-white/8" />
            <Skeleton className="h-[14px] w-full rounded-xl bg-white/8" />
            <Skeleton className="h-[14px] w-[60%] rounded-xl bg-white/8" />
            <Skeleton className="h-[18px] w-[160px] mt-[18px] rounded-xl bg-white/8" />
        </Skeleton>
    )
}

export default NoteSkeleton