import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

const Profile = () => {
    const { user } = useSelector((store: RootState) => store.userStore)

    return (
        <div className="">
            <div className="relative w-full h-[160px] bg-white/2 border border-dashed border-white/30 rounded-3xl">

                <div className="absolute bottom-[-55px] left-[55px] flex">
                    <img
                        className="size-[110px] rounded-2xl mr-[12px] border-[4px] border-white/10"
                        src={user?.photoURL || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                        onError={(e) => (e.currentTarget.src = "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png")}
                        alt="profile-pic"
                    />

                    <div className="flex flex-col mt-[32px]">
                        <span className="text-4xl font-bold mb-[-3px]">{user?.displayName}</span>
                        <span className="text-slate-400">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile