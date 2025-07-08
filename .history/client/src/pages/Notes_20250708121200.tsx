import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"

const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div>
      
    </div>
  )
}

export default Notes