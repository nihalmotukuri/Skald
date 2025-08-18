import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { WordRotate } from "@/components/magicui/word-rotate";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { CiLight } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"
import { MdDone } from "react-icons/md"
import { LuBot } from "react-icons/lu"
import { RiSendPlaneLine } from "react-icons/ri"

const Home = () => {
    const navigate = useNavigate()

    return (
        <>
            <main className="bg-[#0f111a] pt-[64px] pb-[54px] relative overflow-hidden">
                <div className="absolute top-[-1100px] inset-0 m-auto h-[360px] w-[820px] [border-radius:50%] bg-[radial-gradient(ellipse_at_center,_#1e2247_0%,_#0f111a_80%)]">
                    <div className="absolute z-1 top-[-60px] bottom-[-60px] left-[-60px] right-[-60px] backdrop-blur-[30px]"></div>
                </div>

                <section className="absolute z-2 inset-0 m-auto top-[40px]">
                    <div className="m-auto w-[150px] flex justify-center items-center">
                        <img
                            src="/images/logo.png"
                            className="size-[48px] m-auto"
                        />

                        <h1
                            className="ml-[12px] text-xl"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >
                            SKALD
                        </h1>
                    </div>

                    <div className="w-[880px] m-auto mt-[80px] text-center">
                        <h1
                            className="text-white flex justify-center items-center text-8xl font-bold"
                            style={{
                                fontFamily: '"Stint Ultra Expanded", serif',
                            }}
                        >
                            Strike through
                        </h1>

                        <h1
                            className="text-white flex justify-start items-center text-8xl font-bold pl-[104px] mt-[-18px]"
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

                    <div className="w-[150px] m-auto py-4">
                        <InteractiveHoverButton
                            className="text-[#0f111a]"
                            onClick={() => navigate('/signin')}
                        >
                            Get Started
                        </InteractiveHoverButton>
                    </div>

                </section>

                <section className="h-[520px]">
                    <div className="w-[1200px] h-[740px] bg-[radial-gradient(ellipse_at_center,_#1e2247_90%,_rgba(255,255,255,0)_100%)] m-auto [border-radius:50%] black relative mt-[480px]">
                        <div className="absolute z-1 top-[-140px] bottom-[-140px] left-[-140px] right-[-140px] backdrop-blur-[80px]"></div>
                        <div className="w-[1200px] h-[900px] bg-black inset-0 m-auto mt-12 [border-radius:50%] bg-[radial-gradient(ellipse_at_center,_#3e48a6_60%,_#fff_80%)] absolute z-2 top-[-70px]">
                            <div className="absolute top-[-24px] left-[-24px] bottom-[-24px] right-[-24px] backdrop-blur-[4px]"></div>
                        </div>
                        <div className="absolute z-3 inset-0 m-auto top-[-160px] w-[900px] h-[588px] bg-white/1 backdrop-blur- rounded-2xl p-5 border border-blue-900/10">
                            <div className="h-full w-full bg-black/10 backdrop-blur-[10px] border border-white/20 rounded-xl px-3">
                                <div className="border-b border-white/20 w-full h-[48px] flex items-center justify-between px-1">
                                    <img
                                        src="/images/logo.png"
                                        className="size-[24px]"
                                    />

                                    <CiLight className="text-[20px]" />
                                </div>

                                <div className="w-full h-full grid grid-cols-[1fr_1fr_1fr_1fr] grid-rows-[230px_230px] gap-2 pt-4">
                                    <div className="bg-[#0f111a] col-span-1 row-span-1 rounded-2xl p-4">
                                        <img src="/images/dashboard.png" className="w-full" />

                                        <p className="text-[10px] font-bold mt-2 text-right">A focused dashboard for a clear overview of your daily priorities.</p>
                                    </div>

                                    <div className="bg-[#0f111a] col-span-1 row-span-1 rounded-2xl p-4">
                                        <p className="text-white font-bold">To-do List</p>

                                        <div className="flex justify-between items-center bg-[#5a69ff] w-[70px] rounded-xl px-[6px] py-[3px] ml-auto mx-1 text-white/80">
                                            <IoAddOutline className="text-[14px]" />

                                            <span className="text-[10px]">
                                                Add Task
                                            </span>
                                        </div>

                                        <ul className="w-full h-[140px] mt-[10px] flex flex-col justify-between">
                                            <li className="h-[40px] w-full bg-white/10 border border-transparent rounded-md flex items-center p-2">
                                                <MdDone className="text-[12px] text-white/60" />
                                                <p className="text-[10px] px-1 text-white/80">Morning Run</p>
                                                <span className="text-[6px] px-1 text-white/60 border border-white/40 rounded-sm">Fitness</span>
                                            </li>
                                            <li className="h-[40px] w-full bg-white/6 border border-white/40 rounded-md flex items-center p-2">
                                                <div className="size-[10px] rounded-xs border border-white/40"></div>
                                                <p className="text-[10px] px-1 text-white/80">Project Proposal</p>
                                                <span className="text-[6px] px-1 text-white/60 border border-white/40 rounded-sm">Work</span>
                                            </li>
                                            <li className="h-[40px] w-full bg-white/6 border border-white/40 rounded-md flex items-center p-2 opacity-40">
                                                <div className="size-[10px] rounded-xs border border-white/40"></div>
                                                <p className="text-[10px] px-1 mt-[-2px] text-white/80 line-through">Plan the week</p>
                                                <span className="text-[6px] px-1 text-white/60 border border-white/40 rounded-sm">Planning</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-span-2 row-span-2 bg-[#0f111a] rounded-2xl p-4 !pt-[14px]">
                                         <div className="bg-white/6 p-4 !pt-3 rounded-xl mb-2">
                                            <p className="font-bold">A Plan for Watching the Stars</p>
                                            <p className="line-clamp-2 text-[12px] mt-2 text-slate-500">
                                                Inspired by the recent peak of the Perseid meteor shower, this is a plan to properly disconnect and experience the night sky. The goal is to get away from the city's glow and find a moment of perspective by witnessing something ancient and immense. It’s less about astrophotography and more about the simple act of looking up.
                                            </p>
                                        </div>

                                        <div className="bg-white/6 p-4 !pt-3 rounded-xl mb-2">
                                            <p className="font-bold">The Ocean's Unseen Engineers</p>
                                            <p className="line-clamp-2 text-[12px] mt-2 text-slate-500">
                                                This is an exploration into the world of coral reefs, the vibrant underwater cities built by tiny animals. The central theme is understanding that coral is not a plant or a rock, but a living creature that engineers one of the most critical ecosystems on our planet.
                                            </p>
                                            <img className="h-[60px] w-[100px] object-cover rounded-lg mt-2" src="https://s7d1.scene7.com/is/image/CENODS/09806-feature2-reef-hero?$hero$&fmt=webp" alt="" />
                                        </div>

                                        <div className="bg-white/6 p-4 !pt-3 rounded-xl">
                                            <p className="font-bold">The Gardener of the Night Sky</p>
                                            <p className="line-clamp-2 text-[12px] mt-2 text-slate-500">
                                                This is a closer look at the Indian Flying Fox, the large fruit bat often seen as a fleeting shadow against the twilight sky. Far from being a creature of myth, this is one of our most vital suburban neighbors. It's the tireless night-shift worker of our local ecosystem, a flying mammal that plants forests while we sleep.
                                            </p>
                                            <img className="h-[60px] w-[100px] object-cover rounded-lg mt-2" src="https://inaturalist-open-data.s3.amazonaws.com/photos/588765/medium.JPG" alt="" />
                                        </div>
                                    </div>

                                    <div className="col-span-2 row-span-1 bg-[#0f111a] rounded-2xl p-4 flex flex-col items-center justify-between">
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="text-white bg-white/8 flex justify-center items-center p-[6px] w-[28px] rounded-full">
                                                <LuBot />
                                            </div>

                                            <p className="text-[10px]">Hail, traveler. I'm here to guide your thoughts.</p>
                                        </div>

                                        <div className="p-2 w-[300px] bg-white/6 border border-white/10 rounded-xl relative pb-[32px]">
                                            <p className="text-[9px]">
                                                Based on my current notes and tasks, suggest a workflow to reduce context-switching between my creative and administrative work.
                                            </p>

                                            <div className="absolute right-[8px] bottom-[8px] w-[20px] bg-white text-blue-950 p-1 text-xs rounded-full mt-auto">
                                                <RiSendPlaneLine />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}

export default Home
