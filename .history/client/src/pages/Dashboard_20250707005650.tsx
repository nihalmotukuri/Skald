import TaskCompletionChart from '@/components/TaskCompletionChart'
import Heatmap from '@/components/Heatmap'
import OnboardingTasks from '@/components/OnboardingTasks'
import PomodoroTimer from '@/components/PomodoroTimer'
import ClockWidget from '@/components/ClockWidget'

const Dashboard = () => {
  return (
    <>
      <div className='row-span-1 col-span-1 w-full grid grid-cols-1 grid-rows-[320px_1fr] gap-[16px] overflow-y-scroll rounded-[14px]'>
        <div className="w-full col-span-1 row-span-1 grid grid-cols-3 gap-4 max-h-[320px]">
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

        <div className='h-full w-full col-span-1 row-span-1 flex-1 grid grid-cols-3 gap-4'>
          <div className='col-span-2 row-span-1'>
            <Heatmap />
          </div>

          <div className='col-span-1 row-span-1 max-h-[30px]'>
            <OnboardingTasks />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard