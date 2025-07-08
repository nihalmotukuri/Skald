import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"

const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[60px_1fr] overflow-y">
      <div className="w-full row-span-1">
        <input
          className="w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]"
          type="submit"
          placeholder=""
        />
      </div>

    </div>
  )
}

export default Notes