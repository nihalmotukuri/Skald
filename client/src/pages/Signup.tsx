import { FcGoogle } from "react-icons/fc"

const Signup = () => {
  return (
    <main className="bg-[#0f111a] flex justify-center items-center p-[24px] h-screen">
      <form className="w-[400px] bg-white/6 backdrop-blur-[8px] text-white border border-white/20 rounded-3xl flex flex-col justify-start py-[32px] px-[28px] gap-3">
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

        <div className="flex flex-col gap-3">
          <label htmlFor="email">Email</label>
          <input
            className="border outline-none rounded-md py-2 px-3"
            type="email"
            name="email"
            placeholder="m@example.com"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="password">Password</label>
          <input
            className="border outline-none rounded-sm py-2 px-3"
            type="password"
            name="email"
            placeholder=""
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="confirm_password">
            Confirm Password</label>
          <input
            className="border outline-none rounded-sm py-2 px-3"
            type="password"
            name="email"
            placeholder=""
          />
        </div>

        <button
          className="bg-gray-500 p-2 rounded-sm font-bold text-[14px] mt-[12px]"
        >SIGNUP</button>

        <div>
          <div className="flex items-center gap-4">
            <div className="bg-white w-full h-[1px] rounded-sm"></div>
            <span>OR</span>
            <div className="bg-white w-full h-[1px] rounded-sm"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 border px-[24px] py-[10px] rounded-md m-auto mt-[18px]">
            <span>Continue with</span>
            <FcGoogle className="text-[24px]" />
          </button>
        </div>
      </form>
    </main>
  )
}

export default Signup