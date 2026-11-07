import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ListTodo, NotebookPen, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useTasks } from '@/queries/tasks'
import { useNotes } from '@/queries/notes'
import { PiTimerLight } from "react-icons/pi"
import { TbCancel } from "react-icons/tb"
import { TbProgress } from "react-icons/tb"
import { MdOutlineDone } from "react-icons/md"
import TaskCompletionChart from '@/components/TaskCompletionChart'
import Heatmap from '@/components/Heatmap'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import type { Task } from '@/types/task'
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const EMPTY_TASKS: Task[] = []

const Dashboard = () => {
  const userId = useAppStore((state) => state.user?.id)
  const userName = useAppStore((state) => state.user?.displayName.trim().split(/\s+/)[0] || 'there')
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const notesState = useNotes(userId)
  const tasksState = useTasks(userId)
  const notes = notesState.data ?? []
  const tasks = tasksState.data ?? EMPTY_TASKS
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState<string>('')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const dayjsObject = dayjs(currentDate, 'D/M/YYYY')
  const dueDate = dayjsObject.format('DD MMM')

  useEffect(() => {
    if (!currentDate) {
      setFilteredTasks(tasks)
    }

    const newFilteredList = tasks.filter(t => {
      const date = new Date(t.date!)
      const dueDate = date.toLocaleDateString()
      return dueDate === currentDate
    })


    setFilteredTasks(newFilteredList)
  }, [tasks, currentDate])

  const totalTasks = tasks.filter(t => t.status !== "Cancelled").length
  const ongoing = tasks.filter(t => t.status === "In Progress").length
  const completed = tasks.filter(t => t.status === "Done").length
  const pending = tasks.filter(t => t.status === "Pending").length
  const cancelled = tasks.filter(t => t.status === "Cancelled").length

  const now = new Date();
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const tasksThisWeek = tasks.filter(task => {
    const createdAtDate = new Date(task?.completedAt ?? '');
    return createdAtDate >= firstDayOfWeek;
  });

  useEffect(() => {
    setBreadcrumb("Dashboard")
  }, [setBreadcrumb])

  const onLatestNote = (noteId: string) => {
    setActiveNoteId(noteId)
    navigate('/app/notes/')
  }

  const lastNote = notes.at(-1)

  const renderWelcome = () => (
    <section className={`skald-onboarding ${isDark ? 'skald-onboarding--dark' : 'skald-onboarding--light'}`}>
      <div className="skald-onboarding-hero">
        <div className="skald-onboarding-copy">
          <span className="skald-onboarding-eyebrow"><Sparkles size={14} /> A fresh page</span>
          <h2>Welcome in, {userName}.</h2>
          <p>Skald is your space to collect the loose ends, keep the good ideas, and choose what matters next.</p>
        </div>
        <div className="skald-onboarding-mark" aria-hidden="true">
          <span><Sparkles size={25} /></span>
        </div>
      </div>

      <div className="skald-onboarding-progress">
        <div>
          <span className="skald-onboarding-label">YOUR FIRST FEW MINUTES</span>
          <h3>Start with whatever’s on your mind.</h3>
        </div>
        <span className="skald-onboarding-count"><Check size={14} /> No rush</span>
      </div>

      <div className="skald-onboarding-cards">
        <Link to="/app/tasks" className="skald-onboarding-card">
          <span className="skald-onboarding-card-icon"><ListTodo size={19} /></span>
          <span className="skald-onboarding-card-title">Make a little plan</span>
          <span className="skald-onboarding-card-copy">Add the next thing you want to get done.</span>
          <span className="skald-onboarding-card-action">Create a task <ArrowRight size={15} /></span>
        </Link>
        <Link to="/app/notes" className="skald-onboarding-card">
          <span className="skald-onboarding-card-icon"><NotebookPen size={19} /></span>
          <span className="skald-onboarding-card-title">Save a thought</span>
          <span className="skald-onboarding-card-copy">Keep an idea close, even if it’s not for today.</span>
          <span className="skald-onboarding-card-action">Write a note <ArrowRight size={15} /></span>
        </Link>
        <Link to="/app/assistant" className="skald-onboarding-card">
          <span className="skald-onboarding-card-icon"><Sparkles size={19} /></span>
          <span className="skald-onboarding-card-title">Talk it through</span>
          <span className="skald-onboarding-card-copy">Ask Mr Groff to help untangle your next step.</span>
          <span className="skald-onboarding-card-action">Meet Mr Groff <ArrowRight size={15} /></span>
        </Link>
      </div>

      <p className="skald-onboarding-footnote">Your workspace is private. Start small; you can shape it as you go.</p>
    </section>
  )

  const renderDashboard = () => (
    <>
      <div className='col-span-2 pb-4'>
        <div className='w-full h-[340px] grid grid-cols-[repeat(2,1fr)] gap-5 mb-5'>
          <div className='grid grid-cols-[repeat(2,1fr)] grid-rows-[repeat(9,1fr)] gap-3'>
            <div className={`col-1 row-span-5 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border shadow-md text-white rounded-xl p-[18px] flex flex-col justify-between`}>
              <PiTimerLight className='text-[48px]' />
              <div>
                <p className='font-bold text-[18px]'>Ongoing</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{ongoing} Tasks</p>
              </div>
            </div>

            <div className={`col-1 row-span-4 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-md`}>
              <MdOutlineDone className='ml-auto text-[38px]' />
              <div>
                <p className='font-bold text-[18px]'>Completed</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{completed} Tasks</p>
              </div>
            </div>

            <div className={`col-2 row-start-1 row-end-5 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-md`}>
              <TbProgress className='ml-auto text-[42px]' />
              <div>
                <p className='font-bold text-[18px]'>Pending</p>
                <p className='text-[14px] text-slate-500 font-semibold'>{pending} Tasks</p>
              </div>
            </div>

            <div className={`col-2 row-start-5 row-end-10 ${isDark ? "bg-white/2 border-white/10" : "bg-white !text-[#2d3748]"} backdrop-blur-md border text-white rounded-xl p-[18px] flex flex-col justify-between shadow-md`}>
              <TbCancel className='text-[42px]' />
              <div>
                <p className='font-bold text-[18px]'>Cancelled</p>
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
              className={`relative ${isDark ? "bg-white/2 border-white/10 hover:bg-white/4" : "bg-white !text-[#2d3748] hover:bg-neutral-100"} backdrop-blur-md border text-white rounded-2xl shadow-md px-[20px] py-3 mb-5 cursor-pointer h-[207px]`}
              onClick={() => onLatestNote(notes.at(-1)?._id ?? '')}
            >
              <h2 className='font-semibold text-[18px] pb-2 truncate'>{notes.at(-1)?.title}</h2>
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
        <WeeklyCalendar
          setCurrentDate={setCurrentDate}
        />

        <div className={`${notes.length > 0 ? "h-[684px]" : "h-[456px]"} mt-5 ${isDark ? "text-white border-white/10 bg-white/2" : "!text-[#2d3748] bg-white"} backdrop-blur-md border rounded-2xl shadow-lg py-[20px] px-[26px] grid grid-rows-[44px_1fr] shadow-lg`}>
          <p className="font-bold text-[18px] mb-[16px]">
            {currentDate ? `Due on ${dueDate}` : "Completed This Week"}
          </p>

          <div className='overflow-y-auto h-full'>
            <ul className='h-full flex flex-col gap-2 overflow-y-auto relative'>
              {currentDate
                ? (
                  filteredTasks.length > 0
                    ? (filteredTasks.map(ct => (
                      <li className={`p-3 ${isDark ? "bg-white/6" : "bg-white border"} rounded-lg shadow-sm ${ct.status === 'Cancelled' ? "opacity-50" : ""}`} key={ct._id}>
                        <p className={`mb-2 ${ct.status === "Cancelled" ? "line-through" : ""}`}>{ct.title}</p>
                        <div className={`flex ${ct.taskList ? "justify-between" : "justify-end"}`}>
                          {ct.taskList
                            ? (
                              <span className={`text-[12px] py-[1px] px-[8px] rounded-lg border ${isDark ? "border-white/20 text-gray-400" : "bg-[#602bf8] text-white"}`}>
                                {ct.taskList}
                              </span>
                            )
                            : null
                          }
                          <span className='text-[12px] text-slate-500'>
                            {ct.status === "In Progress" ? "Ongoing" : ct.status}
                          </span>
                        </div>
                      </li>
                    )))
                    : (
                      <p
                        className={`text-[15px] text-gray-400 w-full ${isDark ? "bg-white/6" : "bg-neutral-100"} p-3 rounded-lg inline-block m-auto absolute top-0`}
                      >
                        No tasks due. Add a new task for this day.
                      </p>
                    )
                )
                : (
                  tasksThisWeek.length > 0
                    ? tasksThisWeek.map(ct => (
                      <li className={`p-3 ${isDark ? "bg-white/6" : "bg-white border"} rounded-lg shadow-sm`} key={ct._id}>
                        <p className='mb-2'>{ct.title}</p>
                        <div className={`flex ${ct.taskList ? "justify-between" : "justify-end"}`}>
                          {ct.taskList
                            ? (
                              <span className={`text-[12px] py-[1px] px-[8px] rounded-lg border ${isDark ? "border-white/20 text-gray-400" : "bg-[#602bf8] text-white"}`}>
                                {ct.taskList}
                              </span>
                            )
                            : null
                          }
                          <span className='text-[12px] text-slate-500'>
                            {dayjs(ct.completedAt).format("DD MMM")}
                          </span>
                        </div>
                      </li>
                    )) : (totalTasks > 0
                      ? (
                        <p
                          className={`text-[15px] text-gray-400 w-full ${isDark ? "bg-white/6" : "bg-neutral-100"} p-3 rounded-lg inline-block m-auto absolute top-0`}
                        >
                          You haven’t completed any tasks yet. Get started by finishing your first one!
                        </p>
                      )
                      : (
                        <p
                          className={`text-[15px] text-gray-400 w-full ${isDark ? "bg-white/6" : "bg-neutral-100"} p-3 rounded-lg inline-block m-auto absolute top-0`}
                        >
                          You haven’t added any tasks yet. Start by creating your first one!
                        </p>
                      )
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
      {notesState.isError || tasksState.isError
        ? <p role="alert" className="col-span-3">Unable to load dashboard data: {notesState.error?.message ?? tasksState.error?.message}</p>
        : notesState.isLoading || tasksState.isLoading
        ? <DashboardSkeleton />
        : tasks.length === 0 && notes.length === 0
          ? renderWelcome()
          : renderDashboard()}
    </div>
  )
}

export default Dashboard
