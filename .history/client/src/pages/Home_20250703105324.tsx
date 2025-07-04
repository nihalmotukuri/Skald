// import Header from "@/components/Header"
import { WordRotate } from "@/components/magicui/word-rotate";

const Home = () => {
    return (
        <>
            {/* <Header /> */}

            <main className="relative bg-[#0f111a]">
                <h1>
                    Strike through your 
                    <WordRotate words={["Word", "Rotate"]} />.
                </h1>
            </main>

        </>
    )
}

export default Home