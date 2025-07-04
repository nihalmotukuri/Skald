// import Header from "@/components/Header"
import { FlickeringGrid } from "@/components/magicui/flickering-grid";  

const Home = () => {
  return (
    <>
        {/* <Header /> */}

        <main className="relative bg-transparent">
            <FlickeringGrid className="absolute top-0 left-0 z-0"/>

            <div 
                className="absolute z-1 bg-black size-full"
                style={{
                    backdropFilter: "blur(100px"
                }}
            >

            </div>
        </main>

    </>
  )
}

export default Home