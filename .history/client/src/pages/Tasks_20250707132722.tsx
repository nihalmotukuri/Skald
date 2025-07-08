import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full h-[48px] flex justify-end items-center">
          <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
            <CiBoxList />
            <span className="text-[14px]">New List</span>
          </button>

          <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]">
            <IoAddOutline />
            <span className="text-[14px]">New Task</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Tasks