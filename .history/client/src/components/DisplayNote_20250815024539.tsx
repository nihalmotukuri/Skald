import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/redux/store"
import { setActiveNoteId } from "@/redux/notesSlice"
import { RxCross1 } from "react-icons/rx"
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs"

interface DisplayNoteProps {
    fullscreen: boolean;
    setFullscreen: (value: boolean) => void;
}

const DisplayNote = ({ fullscreen, setFullscreen }: DisplayNoteProps) => {
    const { notes, activeNoteId } = useSelector((store: RootState) => store.notesStore)
    const activeNote = notes.find(n => n._id === activeNoteId)
    const dispatch = useDispatch()

    const { isDark } = useSelector((store: RootState) => store.themeStore)

    const onCloseNote = () => {
        dispatch(setActiveNoteId(''))
        setFullscreen(false)
    }
    
    return (
        <div className="overflow-y-auto bg-white/4 p-1">
            <div
                className="sticky top-0 left-0 w-[34px] p-2 text-lg hover:bg-white/10 rounded-[6px] cursor-pointer"
                onClick={onCloseNote}
            >
                <RxCross1 />
            </div>

            <div
                className="absolute top-0 right-[4px] w-[34px] p-2 text-lg hover:bg-white/10 mt-[2px] ml-[4px] rounded-[6px] cursor-pointer"
                onClick={() => setFullscreen(!fullscreen)}
            >
                {fullscreen
                    ? <BsFullscreenExit />
                    : <BsFullscreen />
                }
            </div>

            <div className="py-[24px] pl-[64px] pr-[84px]">
                <h1 className="text-5xl font-bold">{activeNote?.title}</h1>
                {activeNote?.image
                    ? (
                        <img
                            className="w-full mt-[28px] rounded-lg"
                            src={
                                activeNote.image instanceof File
                                    ? URL.createObjectURL(activeNote.image)
                                    : activeNote.image
                            }
                        />
                    ) : null
                }

                <p className="mt-[28px] text-[18px]">
                    {activeNote?.description}
                </p>
            </div>
        </div>
    )
}

export default DisplayNote