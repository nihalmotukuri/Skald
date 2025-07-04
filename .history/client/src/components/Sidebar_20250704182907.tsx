// import { TbLayoutDashboard } from "react-icons/tb"
// import { VscTasklist } from "react-icons/vsc"
// import { CiTimer } from "react-icons/ci"

// const features = [
//     {name: "Dashboard", icon: <TbLayoutDashboard />},
//     {name: "To - do list", icon: <VscTasklist />},
//     {name: "Pomodoro", icon: <CiTimer />},
//     {name: "Notes", icon: < />},
//     {name: "Assistant", icon: < />}
// ]

const Sidebar = () => {
    return (
        <div
            className="bg-[#252a41] w-[260px] m-[24px] rounded-[24px] py-[18px] px-[12px]"
        >
            <div className="w-[150px] flex justify-center items-center">
                <img
                    src="/images/logo.png"
                    className="size-[36px] m-auto logo-animation" />

                <h1
                    className="text-xl"
                    style={{
                        fontFamily: '"Stint Ultra Expanded", serif',
                    }}
                >SKALD</h1>
            </div>

            <ul>
                {/* {features.map(f => f)} */}
            </ul>
        </div>
    )
}

export default Sidebar