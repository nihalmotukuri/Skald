import ClockWidget from "./ClockWidget"
import TaskCompletionChart from "./TaskCompletionChart"
import PomodoroTimer from "./PomodoroTimer"
import Heatmap from './Heatmap'
import OnboardingTasks from './OnboardingTasks'

const DashboardGrid = () => {

    return (
        <>
            <main className="bg-[#0f111a] flex">
                <Sidebar />
                <div className="w-full mt-[18px] grid grid-cols-3 gap-4 auto-rows-[330px]">
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

                <div className='h-full w-full mt-[16px] flex-1 grid grid-cols-3 gap-4 auto-rows-fr'>
                    <div className='col-span-2 row-span-1'>
                        <Heatmap />
                    </div>

                    <div className='col-span-1 row-span-1'>
                        <OnboardingTasks />
                    </div>
                </div>
                <DashboardGrid />
            </main>
        </>
    )
}

export default DashboardGrid