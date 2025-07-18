import { RxCross2 } from "react-icons/rx"

interface AddNoteDialogProps {
    displayAddNote: boolean;
    setDisplayAddNote: (value: boolean) => void;
}

const AddNoteDialog = ({ displayAddNote, setDisplayAddNote } : AddNoteDialogProps) => {
    const addTask = () => { }

    return (
        <section className={`fixed top-0 left-0 z-999 bg-black/40 h-full w-full ${displayAddNote ? 'flex' : 'hidden'} justify-center items-center`}>
            <form
                onSubmit={addTask}
                className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-md shadow-lg p-[24px] w-[420px] flex flex-col gap-[18px] relative"
            >
                <div
                    className='absolute top-0 right-0 p-[6px] bg-white/6 hover:bg-white/10 text-red-5 cursor-pointer'
                    style={{
                        borderBottomLeftRadius: "7px",
                        borderTopRightRadius: "7px"
                    }}
                    onClick={() => setDisplayAddNote(false)}
                >
                    <RxCross2 />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="title">Title</label>
                    <input
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px]'
                        type="text"
                        name="title"
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[15px]' htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        className='bg-white/5 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] resize-none'
                        rows={12}
                    ></textarea>
                </div>

                <button
                    className='bg-white/6 backdrop-blur-md border border-white/10 rounded-md shadow-lg text-[14px] px-[12px] py-[6px] cursor-pointer hover:bg-white/10'
                    type='submit'>
                    Add Note
                </button>
            </form>
        </section>
    )
}

export default AddNoteDialog