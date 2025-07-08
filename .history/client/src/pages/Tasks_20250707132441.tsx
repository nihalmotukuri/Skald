import { CiBoxList } from "react-icons/ci"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full h-[48px] flex justify-end items-center">
          <button className="flex justify-between items-center text-[18px] w-[124px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] text-">
            <CiBoxList />
            <span className="text-[16px]">New List</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Tasks