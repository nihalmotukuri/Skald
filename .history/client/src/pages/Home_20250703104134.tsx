// import Header from "@/components/Header"
// import { FlickeringGrid } from "@/components/magicui/flickering-grid";

const Home = () => {
  return (
    <>
        {/* <Header /> */}

        <main className="relative bg-transparent">
            <FlickeringGrid className="absolute top-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
            className="relative inset-0 "
        squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.1}/>

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