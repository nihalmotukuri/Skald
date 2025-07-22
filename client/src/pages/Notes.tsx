import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumb } from "@/redux/breadcrumbSlice";
import { BsFolderPlus } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import AddNoteDialog from '../components/AddNoteDialog'
import NoteSkeleton from '../components/NoteSkeleton.jsx'

type Note = {
  _id: string;
  title: string;
  description: string;
  // imageUrl?: string;
  createdAt: string;
};

// const notes: Note[] = [
//   {
//     id: 1,
//     title: "Note 1",
//     description:
//       "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
//     imageUrl:
//       "https://www.reuters.com/resizer/v2/HCIZQ6WASROJLDUXA65VXOVB5M.jpg?auth=a55112ef5895d29fd4370cda69f23a4c942cf02c167baaf9778f0279a54233eb&width=3656&quality=80",
//     createdAt: "Just Now",
//   },
//   {
//     id: 2,
//     title: "Trip Ideas",
//     description:
//       "Brainstorming destinations for the winter break — considering Iceland, Japan, or the Alps.",
//     createdAt: "3 mins ago",
//   },
//   {
//     id: 3,
//     title: "React Learning",
//     description:
//       "Review useEffect vs useLayoutEffect, Context API vs Redux, and best practices in state management.",
//     createdAt: "10 mins ago",
//   },
// ];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [displayAddNote, setDisplayAddNote] = useState<boolean>(false)
  const [displayNoteSkeleton, setDisplayNoteSkeleton] = useState(false)
  const dispatch = useDispatch();

  // const [panelWidth, setPanelWidth] = useState(400);
  // const resizerRef = useRef<HTMLDivElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  // const isDragging = useRef(false);

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"));
  }, [dispatch]);

  useEffect(() => {
    setDisplayNoteSkeleton(true)

    const fetchNotes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notes/nihal")
        const data = await res.json()
        setNotes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setDisplayNoteSkeleton(false)
      }
    }

    fetchNotes()
  }, [])

  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!isDragging.current) return;
  //     e.preventDefault(); // prevent unwanted selection
  //     const containerLeft = containerRef.current?.getBoundingClientRect().left || 0;
  //     const newWidth = e.clientX - containerLeft;
  //     if (newWidth >= 280) {
  //       setPanelWidth(newWidth);
  //     }
  //   };

  //   const handleMouseUp = () => {
  //     isDragging.current = false;
  //     document.body.style.userSelect = "auto";
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);
  //   return () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   };
  // }, []);

  // const handleMouseDown = () => {
  //   isDragging.current = true;
  //   document.body.style.userSelect = "none"; // prevent selection
  // };

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto relative">
      <AddNoteDialog displayAddNote={displayAddNote} setDisplayAddNote={setDisplayAddNote} />

      <div className="row-span-1 col-span-1">
        <div className="py-[16px] flex justify-between items-center px-[2px] border-b border-[#32343c]">
          <input
            className="w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]"
            type="search"
            placeholder="Search notes..."
          />
          <div className="flex items-center">
            <button className="flex items-center text-[16px] w-[148px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer">
              <BsFolderPlus />
              <span className="text-[14px] ml-2">New Collection</span>
            </button>
            <button
              className="flex items-center w-[112px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg px-[12px] py-[6px] cursor-pointer ml-[14px]"
              onClick={() => setDisplayAddNote(true)}
            >
              <SlNote className="text-[12px]" />
              <span className="text-[14px] ml-2">Add Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body: resizable note panel */}
      <div
        className="col-span-1 row-span-1 overflow-hidden grid"
      // ref={containerRef}
      // style={{ gridTemplateColumns: `${panelWidth}px 6px 1fr` }}
      >
        {/* Left Note Panel */}
        <div className={`overflow-y-auto py-[12px] px-[18px] /*border-r*/ border-[#32343c] flex flex-col gap-2`}>
          {displayNoteSkeleton
            ? (
              Array.from({ length: 4 }).map((_, index) => (
                <NoteSkeleton key={index} />
              )))
            : (
              notes.map((note) => (
                <div
                  key={note._id}
                  className={`w-full py-[14px] px-[12px] cursor-pointer transition duration-80 ease-in-out hover:bg-white/4 border-b border-[#32343c]`}
                >
                  <h1 className="font-bold text-[20px]">{note.title}</h1>
                  <p className="text-slate-500 line-clamp-2 text-[14px] mt-[2px]">{note.description}</p>
                  {/* {note.imageUrl && (
                <img
                  className="h-[80px] mt-[16px] rounded-lg"
                  src={note.imageUrl}
                />
              )} */}
                  <p className="text-slate-600 text-[14px] mt-[12px]">{note.createdAt}</p>
                </div>
              )
              ))}
        </div>

        {/* Resizer */}
        {/* <div
          ref={resizerRef}
          onMouseDown={handleMouseDown}
          className="cursor-col-resize bg-white/10 hover:bg-white/20 transition-all"
        /> */}

        {/* Right Note Content */}
        {/* <div className="overflow-y-auto py-[24px] pl-[64px] pr-[84px] bg-white/4">
          <h1 className="text-5xl font-bold">Note 1</h1>
          <img
            className="w-full mt-[28px] rounded-lg"
            src="https://www.reuters.com/resizer/v2/HCIZQ6WASROJLDUXA65VXOVB5M.jpg?auth=a55112ef5895d29fd4370cda69f23a4c942cf02c167baaf9778f0279a54233eb&width=3656&quality=80"
          />
          <p className="mt-[28px] text-[18px]">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
          </p>
        </div> */}
      </div>
    </div >
  );
};

export default Notes;
