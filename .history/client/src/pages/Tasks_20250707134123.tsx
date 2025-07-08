import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full py-[] flex justify-between items-center"
          style={{
            borderBottom: "1px solid grey"
          }}
          >
          <h3 className="text-slate-400 text-2xl">My Tasks</h3>

          <div className="flex items-center">
            <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
              <CiBoxList />
              <span className="text-[14px]">New List</span>
            </button>

            <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]">
              <IoAddOutline />
              <span className="text-[14px]">Add Task</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Tasks