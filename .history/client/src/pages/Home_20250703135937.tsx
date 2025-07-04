// import Header from "@/components/Header"
import { WordRotate } from "@/components/magicui/word-rotate";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import FeaturesBentoGrid from "@/components/FeaturesBentoGrid";

const Home = () => {
    return (
        <>
            {/* <Header /> */}

            <main className="relative bg-[#0f111a] pt-[130px] pb-[54px]">
                <section>
                    <div className="m-auto w-[150px] flex justify-center items-center">
                        <img
                            src="/images/logo.png"
                            className="size-[30px] m-auto" />

                        <h1
                            className="ml-[12px] text-2xl"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >SKALD</h1>
                    </div>

                    <div className="w-[700px] m-auto mt-[42px]">
                        <h1
                            className="text-[#0f111a] flex justify-center items-center text-8xl font-bold"
                            style={{
                                fontFamily: '"Noto Sans", sans-serif',
                                textShadow:
                                    '-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white',
                                WebkitTextStroke: '0.5px white',
                            }}
                        >
                            Strike through
                        </h1>


                        <h1
                            className="text-[#0f111a] flex justify-start items-center text-8xl font-bold pl-[60px] mt-[-12px]"
                            style={{
                                fontFamily: '"Noto Sans", sans-serif',
                                textShadow:
                                    '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white',
                                WebkitTextStroke: '0.5px white',
                            }}
                        >
                            your <WordRotate
                                words={["todos", "notes", "goals", "chaos"]}
                                className="ml-[28px]" />
                        </h1>
                    </div>

                    <div className="w-[150px] m-auto pt-6">
                        <InteractiveHoverButton className="text-[#0f111a]">Get Started</InteractiveHoverButton>
                    </div>

                </section>

                <section className="mt-[42px] max-w-[992px] m-auto">
                    <FeaturesBentoGrid />
                </section>
            </main>

        </>
    )
}

export default Home