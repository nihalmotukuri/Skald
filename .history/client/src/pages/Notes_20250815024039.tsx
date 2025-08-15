import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setBreadcrumb } from "@/redux/breadcrumbSlice";
import AddNoteDialog from "@/components/AddNoteDialog";
import EditNoteDialog from "@/components/EditNoteDialog";
import NoteSkeleton from "@/components/NoteSkeleton";
import DisplayNote from "@/components/DisplayNote";
import NoteItem from "@/components/NoteItem";
import { SlNote } from "react-icons/sl";
import { RxCross1 } from "react-icons/rx";
import type { Note } from "@/types/note";

const Notes = () => {
  const { notes, loading } = useSelector((store: RootState) => store.notesStore);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [debouncedFilterQuery, setDebouncedFilterQuery] = useState("");
  const [displayAddNote, setDisplayAddNote] = useState(false);
  const [displayEditNote, setDisplayEditNote] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);

  const dispatch = useDispatch();
  const { activeNoteId } = useSelector((store: RootState) => store.notesStore)

  useEffect(() => {
    dispatch(setBreadcrumb("Notes"));
  }, [dispatch]);

  useEffect(() => {
    const notesReversed = [...notes].reverse();
    if (debouncedFilterQuery) {
      setFilteredNotes(
        notesReversed.filter((n) =>
          n.title.trim().toLowerCase().includes(debouncedFilterQuery.trim().toLowerCase())
        )
      );
    } else {
      setFilteredNotes(notesReversed);
    }
  }, [notes, debouncedFilterQuery]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilterQuery(filterQuery), 500);
    return () => clearTimeout(handler);
  }, [filterQuery]);

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto relative">
      {displayAddNote && <AddNoteDialog setDisplayAddNote={setDisplayAddNote} />}
      {displayEditNote && (
        <EditNoteDialog
          setDisplayEditNote={setDisplayEditNote}
          editNoteId={editNoteId}
        />
      )}

      <div className="row-span-1 col-span-1">
        <div className="py-[16px] flex justify-between items-center px-[2px] border-b border-[#32343c]">
          <div className="relative">
            <input
              className="w-[240px] bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] pr-[32px]"
              type="text"
              placeholder="Search notes..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            {filterQuery && (
              <div
                className="absolute z-1 top-[3px] right-[3px] hover:bg-white/10 p-[6px] rounded-md cursor-pointer"
                onClick={() => setFilterQuery("")}
              >
                <RxCross1 />
              </div>
            )}
          </div>

          <div className="flex items-center">
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

      <div
        className={`relative col-span-1 row-span-1 overflow-y-auto ${fullscreen ? "grid grid-cols-[0px_1fr]" : activeNoteId  ? "grid grid-cols-[400px_1fr]" : ""}`}
      >
        {/* Left Note Panel */}
        <div
          className={`overflow-y-auto ${!fullscreen ? "py-[12px] px-[18px]" : null} ${activeNoteId ? "border-r" : null} border-[#32343c] flex flex-col gap-2`}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => <NoteSkeleton key={idx} />)
            : filteredNotes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                setEditNoteId={setEditNoteId}
                setDisplayEditNote={setDisplayEditNote}
              />
            ))}

          {notes.length === 0 && !loading && (
            <div className="flex justify-center">
              <p className="text-[18px] text-gray-400 text-center mt-[54px] bg-white/6 p-4 rounded-2xl inline-block m-auto">
                You haven’t written any notes yet. Start by jotting down your first one!
              </p>
            </div>
          )}

          {filteredNotes.length === 0 && notes.length > 0 && (
            <div className="flex justify-center">
              <p className="text-[18px] text-gray-400 text-center mt-[54px] bg-white/4 border border-white/10 p-4 rounded-2xl inline-block m-auto">
                No notes match your search.
              </p>
            </div>
          )}
        </div>

        {activeNoteId && (
          <DisplayNote
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
          />
        )}
      </div>
    </div>
  );
};

export default Notes;
