import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"

const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[108px_1fr] overflow-y">
      <div>
        
      </div>

    </div>
  )
}

export default Notes