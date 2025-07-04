// import Header from "@/components/Header"
import { WordRotate } from "@/components/magicui/word-rotate";

const Home = () => {
    return (
        <>
            {/* <Header /> */}

            <main className="relative bg-[#0f111a]  pt-[130px]">
                <div className="w-[700px] m-auto">
                    <h1 className="text-white flex justify-center items-center text-8xl font-bold"
                        style={{ fontFamily: "\"Noto Sans\", sans-serif",
                            
  text-shadow:
    "\"-1px -1px 0 black,\"
     \"1px -1px 0 black,\"
    \"-1px  1px 0 black,\"
     \"1px  1px 0 black;"
  -webkit-text-stroke: 0.5px black";
                         }}>
                        Strike through
                    </h1>

                    <h1
                        className="text-white flex justify-start items-center text-8xl font-bold pl-[80px]">
                        your <WordRotate 
                                words={["todos", "notes", "sessions", "goals", "chaos"]}
                                className="ml-[16px]" />
                    </h1>
                </div>
            </main>

        </>
    )
}

export default Home