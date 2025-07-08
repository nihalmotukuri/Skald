import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"
import { HiOutlineFolderPlus } from "react-icons/hi2"

const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[48px_1fr] overflow-y pt-[16px]">
      <div className="w-full row-span-1">
        <div
          className="w-[240px] bg-white/5 backdrop-blur-md border rounded-md shadow-lg text-[16px] px-[12px] py-[6px] h-full w-[480px] border-1 border-white/50 outline-0 flex items-center px-[18px] text-white/50 flex justify-between"
        >
          <input
            className="outline-0"
            placeholder="Take a note..."
            onFocus={}
          />
          <HiOutlineFolderPlus className="text-white text-[20px] cursor-pointer" />
        </div>
      </div>

    </div>
  )
}

export default Notes