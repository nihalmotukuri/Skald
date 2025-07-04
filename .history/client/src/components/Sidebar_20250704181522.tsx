
const Sidebar = () => {
    return (
        <div
            className="bg-[#252a41] w-[260px] m-[24px] rounded-[24px] py-[28px]"
        >
            <div className="m-auto w-[150px] flex justify-center items-center">
                <img
                    src="/images/logo.png"
                    className="size-[36px] m-auto logo-animation" />

                <h1
                    className="ml-[0px] text-xl"
                    style={{
                        fontFamily: '"Stint Ultra Expanded", serif',
                    }}
                >SKALD</h1>
            </div>
        </div>
    )
}

export default Sidebar