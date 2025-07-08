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
    const [open, setOpen] = useState(true)

    const openSidebar = () => (

    )

    return (
        
    )
}

export default Sidebar