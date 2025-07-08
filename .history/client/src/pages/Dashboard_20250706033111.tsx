import Sidebar from "@/components/Sidebar"
import DashboardGrid from "@/components/DashboardGrid"

const Dashboard = () => {
  return (
    <>
      <div className='row-span-1 col-span-1 h-full w-full grid grid-cols-1 grid-rows-[330px 400px] gap-[16px]'>
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

        <div className='h-full w-full col-span-1 row-span-1 flex-1 grid grid-cols-3 gap-4'>
          <div className='col-span-2 row-span-1 max-h-[400px]'>
            <Heatmap />
          </div>

          <div className='col-span-1 row-span-1 max-h-[400px]'>
            <OnboardingTasks />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard