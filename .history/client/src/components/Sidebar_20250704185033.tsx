import { TbLayoutDashboard } from "react-icons/tb"
import { VscTasklist } from "react-icons/vsc"
import { CiTimer } from "react-icons/ci"
import { SlNotebook } from "react-icons/sl";
import { BsLightningChargeFill } from "react-icons/bs";

const features = [
    { name: "Dashboard", icon: <TbLayoutDashboard /> },
    { name: "To-do List", icon: <VscTasklist /> },
    { name: "Pomodoro", icon: <CiTimer /> },
    { name: "Notes", icon: <SlNotebook /> },
    { name: "Assistant", icon: <BsLightningChargeFill /> }
]

const Sidebar = () => {

    return (
        <div
            className="bg-[#252a41] w-[260px] m-[24px] rounded-[24px] py-[28px] px-[12px] flex flex-col justify-between"
        >
            <div>
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

                <ul className="p-[12px]">
                    {features.map(f => (
                        <li
                            key={f.name}
                            className="flex items-center gap-4 py-2 px-3 hover:bg-[#2e3350] rounded-lg cursor-pointer text-[18px] my-[12px]">
                            <span className="text-[24px]">{f.icon}</span>
                            <span>{f.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex">
                <img 
                    className="size-[40px] rounded-[8px]"
                    src="https://hds.hel.fi/images/foundation/visual-assets/placeholders/user-image-l@3x.png" 
                    alt="profile-pic" />

                <div>
                    <h6>nihal</h6>
                    <p>nihal@gmail.com</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar