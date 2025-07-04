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
        {show && }
        
    )
}

export default Header