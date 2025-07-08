import { CiBoxList } from "react-icons/ci"

const Tasks = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className="w-full h-[48px] flex justify-end items-center">
          <button className="flex items-center text-[18px]">
            <CiBoxList className="" />
            <span>New List</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Tasks