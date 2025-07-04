// import Header from "@/components/Header"
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

const Home = () => {
  return (
    <>
        {/* <Header /> */}

        <main className="relative bg-transparent">
            <FlickeringGrid className="absolute top-0 left-0 z-1"/>

            <div 
                className="absolute z-2 size-full"
                style={{
                    backdropFilter: "blur(2px)",
                    backgroundColor: "rgba(0, 0, 52, 0.297)"
                }}
            >

            </div>
        </main>

    </>
  )
}

export default Home