import { useState } from 'react'
import { TbLayoutDashboard } from "react-icons/tb"
import { VscTasklist } from "react-icons/vsc"
import { SlNotebook } from "react-icons/sl";
import { BsLightningChargeFill } from "react-icons/bs";

const features = [
    { name: "Dashboard", icon: <TbLayoutDashboard /> },
    { name: "To-do List", icon: <VscTasklist /> },
    // { name: "Pomodoro", icon: <CiTimer /> },
    { name: "Notes", icon: <SlNotebook /> },
    { name: "Assistant", icon: <BsLightningChargeFill /> }
]

const Sidebar = () => {
    const [open] = useState<boolean>(false)

    const openSidebar = () => (
        <div
            className="bg-[#1b1d26] min-w-[280px] m-[24px] rounded-[18px] p-[8px] flex flex-col justify-between"
        >
            <div>
                <div className="w-[150px] flex justify-center items-center mt-[10px]">
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

                <ul className="px-[12px] mt-[18px]">
                    {features.map(f => (
                        <li
                            key={f.name}
                            className="flex items-center gap-3 py-2 px-3 hover:bg-[#0f111a5f] rounded-lg cursor-pointer text-[18px] my-[10px]">
                            <span className="text-[24px]">{f.icon}</span>
                            <span>{f.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex items-center hover:bg-[#0f111a5f] p-[8px] rounded-[12px] cursor-pointer">
                <img
                    className="size-[40px] rounded-[10px] mr-[8px]"
                    src="https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"
                    alt="profile-pic" />

                <div>
                    <h6 className="text-[18px]">sourish</h6>
                    <p className="mt-[-4px] text-[14px]">sourish@example.com</p>
                </div>
            </div>
        </div>
    )

    const closeSidebar = () => (
        <div
            className="bg-[#1b1d26] m-[24px] rounded-[18px] p-[0px] flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-center items-center mt-[10px]">
                    <img
                        src="/images/logo.png"
                        className="size-[36px] m-auto logo-animation" />
                </div>

                <ul className="mt-[18px]">
                    {features.map(f => (
                        <li
                            key={f.name}
                            className="flex items-center gap-3 py-2 px-3 hover:bg-[#0f111a5f] rounded-lg cursor-pointer text-[18px] my-[10px]">
                            <span className="text-[24px]">{f.icon}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex items-center hover:bg-[#0f111a5f] p-[8px] rounded-[12px] cursor-pointer">
                <img
                    className="size-[40px] rounded-[10px]"
                    src="https://i.pinimg.com/736x/3b/73/48/3b73483fa5af06e3ba35f4f71e541e7a.jpg"
                    alt="profile-pic" />
            </div>
        </div>
    )

    const renderSidebar = open ? openSidebar() : closeSidebar()

    return renderSidebar
}

export default Sidebar