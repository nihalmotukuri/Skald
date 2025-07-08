import { CiBoxList } from "react-icons/ci"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full h-[48px] flex justify-end items-center">
          <button className="flex justify-between items-center text-[18px] w-[100px] bg-white/5 backdrop-blur-md border border-white/10 rounded-mx shadow-lg">
            <CiBoxList />
            <span>New List</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Tasks