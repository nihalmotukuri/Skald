// import Header from "@/components/Header"
import { WordRotate } from "@/components/magicui/word-rotate";

const Home = () => {
    return (
        <>
            {/* <Header /> */}

            <main className="relative bg-[#0f111a]">
                <div className="w-[500px] m-auto">
                    <h1 className="text-white flex justify-center items-center text-6xl font-semibold"
                        style={{ fontFamily: "\"Noto Sans\", sans-serif" }}>
                        Strike through
                    </h1>

                    <h1
                        className="text-white flex justify-center items-center text-6xl font-semibold">
                        your <WordRotate 
                        words={["todos", "notes", "sessions", "goals", "chaos"]} />
                    </h1>
                </div>
            </main>

        </>
    )
}

export default Home