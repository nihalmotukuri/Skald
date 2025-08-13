import { useNavigate } from "react-router-dom";
import Header from "@/components/Header"
import Footer from "@/components/Footer";
import { WordRotate } from "@/components/magicui/word-rotate";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import FeaturesBentoGrid from "@/components/FeaturesBentoGrid";

const Home = () => {
    const navigate = useNavigate()

    return (
        <>
            <Header />

            <main className="bg-[#0f111a] pt-[100px] pb-[54px]">
                <section>
                    <div className="m-auto w-[150px] flex justify-center items-center">
                        <img
                            src="/images/logo.png"
                            className="size-[54px] m-auto logo-animation"
                        />

                        <h1
                            className="ml-[12px] text-2xl"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >
                            SKALD
                        </h1>
                    </div>

                    <div className="w-[880px] m-auto mt-[54px] text-center">
                        <h1
                            className="text-white flex justify-center items-center text-8xl font-bold"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >
                            Strike through
                        </h1>

                        <h1
                            className="text-white flex justify-start items-center text-8xl font-bold pl-[104px] mt-[-12px]"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >
                            <span>your</span>
                            <WordRotate
                                words={["todos", "notes", "goals", "chaos"]}
                                className="ml-[40px]"
                            />
                        </h1>
                    </div>

                    <div className="w-[150px] m-auto py-6">
                        <InteractiveHoverButton
                            className="text-[#0f111a]"
                            onClick={() => navigate('/signin')}
                        >
                            Get Started
                        </InteractiveHoverButton>
                    </div>

                </section>

                <section className="mt-[42px] max-w-[992px] m-auto">
                    <FeaturesBentoGrid />
                </section>
            </main>

            <Footer />
        </>
    )
}

export default Home
