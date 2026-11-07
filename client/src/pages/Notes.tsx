import { useEffect, useMemo, useState } from "react";
import { useAppStore } from '@/store/appStore'
import { useNotes, useNoteMutations } from '@/queries/notes'
import AddNoteDialog from "@/components/AddNoteDialog";
import EditNoteDialog from "@/components/EditNoteDialog";
import NoteSkeleton from "@/components/NoteSkeleton";
import DisplayNote from "@/components/DisplayNote";
import NoteItem from "@/components/NoteItem";
import { SlNote } from "react-icons/sl";
import { RxCross1 } from "react-icons/rx";

const Notes = () => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: notes = [], isLoading: loading, error } = useNotes(userId)
  const { deleteNote } = useNoteMutations(userId)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const [filterQuery, setFilterQuery] = useState("");
  const [debouncedFilterQuery, setDebouncedFilterQuery] = useState("");
  const [displayAddNote, setDisplayAddNote] = useState(false);
  const [displayEditNote, setDisplayEditNote] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setBreadcrumb("Notes");
  }, [setBreadcrumb]);

  const filteredNotes = useMemo(() => {
    const notesReversed = [...notes].reverse();
    if (debouncedFilterQuery) {
      return notesReversed.filter((n) =>
        n.title.trim().toLowerCase().includes(debouncedFilterQuery.trim().toLowerCase())
      );
    }
    return notesReversed
  }, [notes, debouncedFilterQuery]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilterQuery(filterQuery), 500);
    return () => clearTimeout(handler);
  }, [filterQuery]);

  return (
    <div className="w-full col-span-1 row-span-1 grid grid-cols-1 grid-rows-[68px_1fr] overflow-y-auto relative">
      {error && <p role="alert" className="absolute top-[64px] right-4 z-10 rounded bg-red-950/90 px-3 py-2 text-sm text-red-100">Unable to load notes: {error.message}</p>}
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
                className={`${isDark ? "bg-white/5 border-white/10" : "!border-black/10 shadow-sm"} w-[240px] border rounded-md text-[14px] px-[12px] py-[6px] pr-[32px]`}
              type="text"
              placeholder="Search notes..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            {filterQuery && (
              <div
                className={`absolute z-1 top-[3px] right-[3px] hover:${isDark ? "bg-white/10" : "bg-black/10"} p-[6px] rounded-md cursor-pointer`}
                onClick={() => setFilterQuery("")}
              >
                <RxCross1 />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              className={`flex justify-between items-center w-[112px] ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "!border-black/10 shadow-sm hover:bg-neutral-100 text-gray-600"} backdrop-blur-md border rounded-md px-[12px] py-[6px] cursor-pointer`}
              onClick={() => setDisplayAddNote(true)}
            >
              <SlNote className="text-[12px]" />
              <span className="text-[14px] ml-2">Add Note</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`relative col-span-1 row-span-1 overflow-y-auto ${fullscreen ? "grid grid-cols-[0px_1fr]" : activeNoteId ? "grid grid-cols-[400px_1fr]" : ""}`}
      >
        <div
          className={`overflow-y-auto ${!fullscreen ? "py-[12px] px-[18px]" : null} ${activeNoteId && !fullscreen ? "border-r" : null} border-[#32343c] flex flex-col gap-2`}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => <NoteSkeleton key={idx} />)
            : filteredNotes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                deleteNote={(noteId) => deleteNote.mutate(noteId)}
                setEditNoteId={setEditNoteId}
                setDisplayEditNote={setDisplayEditNote}
              />
            ))}

          {notes.length === 0 && !loading && !error && (
            <div className="flex justify-center">
              <p className="text-[18px] text-gray-400 text-center mt-[54px] bg-white/6 p-4 rounded-2xl inline-block m-auto">
                You haven’t written any notes yet. Start by jotting down your first one!
              </p>
            </div>
          )}

          {filteredNotes.length === 0 && notes.length > 0 && !error && (
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
