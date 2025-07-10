import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setBreadcrumb } from "@/redux/breadcrumbSlice"
import { BsFolderPlus } from "react-icons/bs"
import { SlNote } from "react-icons/sl"

type Note = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string; // could be a Date or formatted string
};


const notes: Note[] = [
  {
    id: 1,
    title: "Note 1",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    imageUrl:
      "https://www.reuters.com/resizer/v2/HCIZQ6WASROJLDUXA65VXOVB5M.jpg?auth=a55112ef5895d29fd4370cda69f23a4c942cf02c167baaf9778f0279a54233eb&width=3656&quality=80",
    createdAt: "Just Now",
  },
  {
    id: 2,
    title: "Trip Ideas",
    description:
      "Brainstorming destinations for the winter break — considering Iceland, Japan, or the Alps.",
    imageUrl: "",
    createdAt: "3 mins ago",
  },
  {
    id: 3,
    title: "React Learning",
    description:
      "Review useEffect vs useLayoutEffect, Context API vs Redux, and best practices in state management.",
    createdAt: "10 mins ago",
  },
  {
    id: 4,
    title: "Design To-Do",
    description:
      "Update hero section, add transitions to cards, improve mobile spacing and check dark mode contrast.",
    imageUrl: "",
    createdAt: "Today",
  },
];


const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"))
  }, [dispatch])

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto">
      <div
        className="row-span-1 col-span-1"
      >
        <div
          className="py-[16px] flex justify-between items-center px-[2px]"
          style={{
            borderBottom: "1px solid #32343c"
          }}
        >
          <input
            className="w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]"
            type="search"
            placeholder="Search notes..."
          />

          <div className="flex items-center">
            <button className="flex justify-between items-center text-[16px] w-[148px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
              <BsFolderPlus />
              <span className="text-[14px]">New Collection</span>
            </button>

            <button className="flex justify-between items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]">
              <SlNote className="text-[12px]" />
              <span className="text-[14px]">Add Note</span>
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-1 row-span-1 overflow-y-auto grid grid-cols-[400px_1fr]">
        <div
          className="col-span-1 overflow-y-auto py-[12px] px-[18px] flex flex-col"
          style={{
            borderRight: "1px solid #32343c"
          }}
        >
          {notes.map(note => (
            <div
              className={`w-full py-[14px] px-[12px] cursor-pointer transition duration-80 ease-in-out hover:bg-white/4 ${note.id !== notes.length ? "border-b-[0.5px]" : ""} ${note.id !== 1 ? "border-t-[0.5px]" : ""} border-[#32343c]`}
            >
              <h1 className="font-bold text-[24px]">{note.title}</h1>

              <p className="text-slate-500 line-clamp-2">
                {note.description}
              </p>

              {note.imageUrl
                ? <img
                  className="h-[80px] mt-[16px] rounded-lg"
                  src={note.imageUrl}
                />
                : ""
              }

              <p className="text-slate-600 text-[14px] mt-[12px]">{note.createdAt}</p>
            </div>
          ))}
        </div>

        <div className="relative col-span-1 row-span1 overflow-y-auto py-[24px] pl-[64px] pr-[84px]">
          <div>
            <h1 className="text-5xl font-bold">Note 1</h1>

            <img
              className="w-full mt-[28px] rounded-lg"
              src="https://www.reuters.com/resizer/v2/HCIZQ6WASROJLDUXA65VXOVB5M.jpg?auth=a55112ef5895d29fd4370cda69f23a4c942cf02c167baaf9778f0279a54233eb&width=3656&quality=80"
            />

            <p className="mt-[28px] text-[18px]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
          </div>

          {/* <div className="sticky bottom-0 m-auto z-10 h-[50px] w-[480px] backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-4"></div> */}
        </div>
      </div>
    </div>
  )
}

export default Notes