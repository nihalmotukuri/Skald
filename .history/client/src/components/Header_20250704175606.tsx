import { useState, useEffect } from 'react'
import { ShinyButton } from "@/components/magicui/shiny-button"

const Header = () => {
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 160) {
                setShow(true);
            } else {
                setShow(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {show && (
                <header
                    className="h-[56px] w-[760px] m-auto fixed z-999 top-[36px] left-1/2 transform -translate-x-1/2 bg-slate-300/24 backdrop-blur-sm rounded-[36px] flex justify-between items-center px-[18px] header-animation"
                >
                    <img className="size-[32px]" src="/images/logo.png" />

                    <ShinyButton className='rounded-[36px]'>Login</ShinyButton>
                </header>
            )}
        </>
    )
}

export default Header