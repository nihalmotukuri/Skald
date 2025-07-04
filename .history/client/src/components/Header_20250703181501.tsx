import { useState, useEffect } from 'react'
import { ShinyButton } from "@/components/magicui/shiny-button"

const Header = () => {
    const [show, setShow] = useState<>(false)

  return (
    <header 
    className="h-[60px] w-[760px] m-auto fixed z-999 top-[84px] left-1/2 transform -translate-x-1/2 bg-slate-300/24 backdrop-blur-sm rounded-[18px] flex justify-between items-center px-[18px]">
        <img className="size-[32px]" src="/images/logo.png"/>

        <ShinyButton>Login</ShinyButton>
    </header>
  )
}

export default Header