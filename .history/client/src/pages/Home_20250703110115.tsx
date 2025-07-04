// import Header from "@/components/Header"
import { WordRotate } from "@/components/magicui/word-rotate";

const Home = () => {
    return (
        <>
            {/* <Header /> */}

            <main className="relative bg-[#0f111a]">
                <h1 className="text-white flex items-center text-6xl"
                style={{ font-family: "/</main>"Noto Sans", sans-serif"}}>
                    Strike through your 
                    <WordRotate words={["todos", "notes", "sessions", "goals", "chaos"]} />.
                </h1>
            </main>

        </>
    )
}

export default Home