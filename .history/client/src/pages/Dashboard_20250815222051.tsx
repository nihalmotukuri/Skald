import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/redux/store'
import { setActiveNoteId } from '@/redux/notesSlice'
import { setBreadcrumb } from '@/redux/breadcrumbSlice'
import { PiTimerLight } from "react-icons/pi"
import { TbCancel } from "react-icons/tb"
import { TbProgress } from "react-icons/tb"
import { MdOutlineDone } from "react-icons/md"
import TaskCompletionChart from '@/components/TaskCompletionChart'
import Heatmap from '@/components/Heatmap'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import dayjs from "dayjs";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const notesState = useSelector((store: RootState) => store.notesStore)
  const tasksState = useSelector((store: RootState) => store.tasksStore)
  const { isDark } = useSelector((store: RootState) => store.themeStore)

  const notes = notesState.notes
  const tasks = tasksState.tasks

  const totalTasks = tasks.filter(t => t.status !== "Cancelled").length
  const ongoing = tasks.filter(t => t.status === "In Progress").length
  const completed = tasks.filter(t => t.status === "Done").length
  const pending = tasks.filter(t => t.status === "Pending").length
  const cancelled = tasks.filter(t => t.status === "Cancelled").length

  const now = new Date();
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const tasksThisWeek = tasks.filter(task => {
    const createdAtDate = new Date(task?.completedAt ?? '');
    return createdAtDate >= firstDayOfWeek;
  });

  useEffect(() => {
    dispatch(setBreadcrumb("Dashboard"))
  }, [dispatch])

  const onLatestNote = (noteId: string) => {
    dispatch(setActiveNoteId(noteId))
    navigate('/app/notes/')
  }

  const lastNote = notes.at(-1)

  const renderDashboard = () => (
    <>
      <div className='col-span-2 px-3 pb-7'>
        <div className='w-full h-[340px] grid grid-cols-[repeat(2,1fr)] gap-5 mb-5'>
          <div className='grid grid-cols-[repeat(2,1fr)] grid-rows-[repeat(9,1fr)] gap-3'>
            <div className={`col-1 row-span-5 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border shadow-xl text-white rounded-xl p-[18px] flex flex-col justify-between`}>
              <PiTimerLight className='text-[48px]' />
              <div>
                <p className='font-bold text-[18px]'>Ongoing</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{ongoing} Tasks</p>
              </div>
            </div>

            <div className={`col-1 row-span-4 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-xl`}>
              <MdOutlineDone className='ml-auto text-[38px]' />
              <div>
                <p className='font-bold text-[18px]'>Completed</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{completed} Tasks</p>
              </div>
            </div>

            <div className={`col-2 row-start-1 row-end-5 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-xl`}>
              <TbProgress className='ml-auto text-[42px]' />
              <div>
                <p className='font-bold text-[18px]'>Pending</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{pending} Tasks</p>
              </div>
            </div>

            <div className={`col-2 row-start-5 row-end-10 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-xl`}>
              <TbCancel className='text-[42px]' />
              <div>
                <p className='font-bold text-[18px]'>Cancel</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{cancelled} Tasks</p>
              </div>
            </div>
          </div>

          <div className="row-span-1 col-span-1">
            <TaskCompletionChart total={totalTasks} completed={completed} />
          </div>
        </div>

        {notes.length > 0
          ? (
            <div
              className={`relative ${isDark ? "bg-white/2 border-white/10 hover:bg-white/4" : "bg-white !text-[#2d3748] hover:bg-neutral-100"} backdrop-blur-md border text-white rounded-2xl shadow-xl px-[20px] py-3 mb-5 cursor-pointer h-[207px]`}
              onClick={() => onLatestNote(notes.at(-1)?._id ?? '')}
            >
              <h2 className='font-bold text-[18px] pb-2 truncate'>{notes.at(-1)?.title}</h2>
              <p className='text-slate-500 line-clamp-2'>{notes.at(-1)?.description}</p>
              <img
                className='h-[80px] w-[120px] object-cover mt-3 rounded-xl bg-white/20'
                src={lastNote?.image instanceof File ? URL.createObjectURL(lastNote?.image) : lastNote?.image || undefined}
                alt="Note Image"
              />
              <p className={`absolute bottom-5 right-5 text-[14px] px-[8px] py-1 rounded-2xl border ${isDark ? "text-gray-300 border-white/20 bg-white/6" : "text-white border-black/20 bg-[#602bf8]"} `}>✨ Latest note</p>
            </div>
          ) : null
        }

        <Heatmap />
      </div>

      <div className='col-span-1'>
        <WeeklyCalendar />

        <div className={`${notes.length > 0 ? "h-[684px]" : "h-[456px]"} mt-5 ${isDark ? "text-white border-white/10 bg-white/2" : "!text-[#2d3748] bg-white"} backdrop-blur-md border rounded-2xl shadow-xl py-[20px] px-[26px] grid grid-rows-[44px_1fr] shadow-lg`}>
          <p className="font-bold text-[18px] mb-[16px]">
            Completed This Week
          </p>

          <div className='overflow-y-auto h-full'>
            <ul className='h-full flex flex-col gap-2 overflow-y-auto relative'>
              {tasksThisWeek.length > 0
                ? tasksThisWeek.map(ct => (
                  <li className={`p-3 ${isDark ? "bg-white/6" : "bg-white border"} rounded-lg shadow-md`} key={ct._id}>
                    <p className='mb-2'>{ct.title}</p>
                    <div className='flex justify-between'>
                      <span className={`text-[12px] py-[1px] px-[8px] rounded-lg border ${isDark ? "border-white/20 text-gray-400" : "bg-[#602bf8] text-white"}`}>
                        {ct.taskList}
                      </span>
                      <span className='text-[12px] text-slate-500'>
                        {dayjs(ct.completedAt).format("DD MMM")}
                      </span>
                    </div>
                  </li>
                ))
                : (totalTasks > 0
                  ? (
                    <p
                      className={`text-[15px] text-gray-400 ${isDark ? "bg-white/6" : "bg-neutral-100"} p-3 rounded-lg inline-block m-auto absolute top-0`}
                    >
                      You haven’t completed any tasks yet. Get started by finishing your first one!
                    </p>
                  )
                  : (
                    <p
                      className={`text-[15px] text-gray-400 ${isDark ? "bg-white/6" : "bg-neutral-100"} p-3 rounded-lg inline-block m-auto absolute top-0`}
                    >
                      You haven’t added any tasks yet. Start by creating your first one!
                    </p>
                  )
                )
              }
            </ul>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className='row-span-1 col-span-1 w-full overflow-y-auto pt-[16px] grid grid-cols-[repeat(3,1fr)] gap-5'>
      {/* {notesState.loading || tasksState.loading
        ? <DashboardSkeleton />
        : renderDashboard()} */}
        
    </div>
  )
}

export default Dashboard
