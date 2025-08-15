import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { createUser } from '@/redux/userThunks'
import { useNavigate } from 'react-router-dom'
import { FcGoogle } from "react-icons/fc"
import { signInWithGoogle } from '@/auth/firebase.ts'
import Cookies from 'js-cookie'
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'
import Marquee from 'react-fast-marquee'

const SignIn = () => {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { pathname } = useSelector((store: RootState) => store.userStore)

    const handleGoogleSignin = async () => {
        setLoading(true)
        const { idToken } = await signInWithGoogle()
        Cookies.set('skald_token', idToken)
        const res = await dispatch(createUser(idToken))
        console.log(res)
        if (res.payload.ok) {
            setLoading(false)
            navigate('/app/dashboard')
        }
    }

    return (
        <main className="bg-[#0f111a] flex flex-col justify-between items-center p-[24px] h-screen relative">
            {loading && <div className='bg-white/2 backdrop-blur-sm absolute top-0 left-0 z-2 size-full flex justify-center items-center'>
                <Ring
                    size="60"
                    stroke="6"
                    bgOpacity="0"
                    speed="2"
                    color="#5a69ff"
                />
            </div>}
            <Marquee>
                {Array.from({ length: 10 }).map((_, index) => (
                    <h1
                        key={index}
                        className='px-[100px] text-2xl'
                        style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
                    >SKALD</h1>
                ))}
            </Marquee>

            <Marquee direction='right'>
                {Array.from({ length: 10 }).map((_, index) => (
                    <h1
                        key={index}
                        className='px-[100px] text-2xl'
                        style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
                    >SKALD</h1>
                ))}
            </Marquee>

            <div className='absolute z-1 top-0 left-0 w-full h-full flex justify-center items-center'>
                <div className="w-[380px] bg-white/4 backdrop-blur-[8px] text-white border border-white/20 rounded-3xl flex flex-col justify-start py-[36px] px-[28px] gap-3 scale-116">
                    <div className="w-[150px] flex justify-center items-center m-auto pr-[12px]">
                        <img
                            src="/images/logo.png"
                            className="size-[42px] m-auto logo-animation mr-[10px]"
                        />
                        <h1
                            className="text-xl"
                            style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
                        >
                            SKALD
                        </h1>
                    </div>

                    <h1
                        className='text-3xl text-center mt-[24px]'
                        style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
                    >Forge your path. Sign in to begin.</h1>

                    <div>
                        <button
                            onClick={handleGoogleSignin}
                            className="w-full flex items-center justify-center gap-3 border px-[24px] py-[10px] rounded-md m-auto mt-[24px] cursor-pointer hover:bg-white/5"
                            style={{ fontFamily: '"Stint Ultra Expanded", serif' }}
                        >
                            <span>Continue with</span>
                            <FcGoogle className="text-[24px]" />
                        </button>
                    </div>
                </div>
            </div>

        </main>
    )
}

export default SignIn