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
            className="bg-[#252a41] w-[240px] m-[24px] rounded-[24px] py-[28px] px-[12px]"
        >
            <div>

            </div>

            <div >

            </div>
        </div>
    )
}

export default Sidebar