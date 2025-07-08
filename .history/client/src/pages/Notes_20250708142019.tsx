import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"
import { HiOutlineFolderPlus } from "react-icons/hi2"

const Notes = () => {
  const dispatch = useDispatch()
  const [writeNote, setWriteNote] = useState(false)

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div className="w-full col-span-1 row-span-1 overflow-y pt-[16px]">
      <div className="w-full">
        {!writeNote && (
          <div
            className="w-[240px] bg-white/5 backdrop-blur-md border rounded-md shadow-lg text-[16px] px-[12px] py-[6px] h-[54px] w-[480px] border-1 border-white/50 outline-0 flex items-center px-[18px] text-white/50 flex justify-between"
          >
            <input
              className="outline-0"
              placeholder="Take a note..."
              onFocus={() => setWriteNote(true)}
            />
            <HiOutlineFolderPlus className="text-white text-[20px] cursor-pointer" />
          </div>
        )}
        {writeNote && (
          <div
            className="min-h-[108px] w-[480px] bg-white/5 backdrop-blur-md border rounded-md shadow-lg text-[16px] p-[12px] border-1 border-white/50 outline-0 px-[18px] text-white/60"
          >
            <input
              className="text-2xl outline-0"
              type="text"
              placeholder="Title"
            />

            <textarea
              rows={1}
              className="w-full resize-none overflow-hidden outline-0"
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              placeholder="Take a note"
            />
          </div>
        )}
      </div>

    </div>
  )
}

export default Notes