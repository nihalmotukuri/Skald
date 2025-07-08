import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"

const Assistant = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div>Assistant</div>
  )
}

export default Assistant