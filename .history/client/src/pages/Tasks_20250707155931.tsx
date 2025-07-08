import { CiBoxList } from "react-icons/ci"
import { IoAddOutline } from "react-icons/io5"

const Tasks = () => {
  return (
    <>
      <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto">
        <div className="row-span-1 col-span-1 py-[16px] flex justify-between items-center"
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

        <div className="row-span-1 col-span-1 overflow-y-auto">
          <ul className="pt-[24px]">
            <li className="flex items-start justify-between border border-white/5 rounded-lg p-3">

            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Tasks