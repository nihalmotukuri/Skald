// import Header from "@/components/Header"
import { FlickeringGrid } from "@/components/magicui/flickering-grid";  

const Home = () => {
  return (
    <>
        {/* <Header /> */}

        <main className="relative bg-transparent">
            <FlickeringGrid className="absolute top-0 left-0 z-0"/>

            <div 
                className="absolute z-1 size-full"
                style={{
                    backdropFilter: "blur(10px)",
                    backgroundColor: "red"
                }}
            >

            </div>
        </main>

    </>
  )
}

export default Home