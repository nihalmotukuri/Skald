import TaskCompletionChart from '@/components/TaskCompletionChart'
import Heatmap from '@/components/Heatmap'
import OnboardingTasks from '@/components/OnboardingTasks'
import PomodoroTimer from '@/components/PomodoroTimer'
import ClockWidget from '@/components/ClockWidget'

const Dashboard = () => {
  return (
    <>
      <div className='h-full w-full grid grid-rows-[auto_1fr] gap-[16px]'>
        <div className="w-full col-span-1 row-span-1 grid grid-cols-3 gap-4 mt-[16px]">
          <div className="row-span-1 col-span-1">
            <TaskCompletionChart />
          </div>

          <div className="row-span-1 col-span-1">
            <PomodoroTimer />
          </div>

          <div className="row-span-1 col-span-1">
            <ClockWidget />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 min-h-0">
    <div className="col-span-2 overflow-hidden">
      <Heatmap />
    </div>
    <div className="col-span-1 overflow-hidden">
      <OnboardingTasks />
    </div>
  </div>
      </div>
    </>
  )
}

export default Dashboard