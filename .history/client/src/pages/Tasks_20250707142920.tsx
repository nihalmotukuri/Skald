import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full py-[16px] flex justify-between items-center"
          style={{
            borderBottom: "1px solid #32343c"
          }}
        >
          <input
            className="w-[200px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px]  px-[12px] py-[6px]"
            type="search"
            placeholder="Filter tasks..."
          />

          <div className="flex items-center">
            <button className="flex justify-between items-center text-[18px] w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
              <CiBoxList />
              <span className="text-[14px]">New List</span>
            </button>

            <button className="flex justify-between items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]">
              <IoAddOutline className="text-[20px]" />
              <span className="text-[14px]">Add Task</span>
            </button>
          </div>
        </div>

        <ul className="max-h-ful">

        </ul>
      </div>
    </>
  )
}

export default Tasks