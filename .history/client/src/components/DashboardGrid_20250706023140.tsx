import { useSelector, useDispatch } from 'react-redux'
import ClockWidget from "./ClockWidget"
import { BsLayoutSidebarInset } from "react-icons/bs"
import { MdArrowForwardIos } from "react-icons/md"
import TaskCompletionChart from "./TaskCompletionChart"
import PomodoroTimer from "./PomodoroTimer"
import { CiLight, CiDark } from "react-icons/ci"
import { toggleSidebar } from '@/redux/sidebarSlice'
import { toggleTheme } from '@/redux/themeSlice'
import Heatmap from './Heatmap'
import OnboardingTasks from './OnboardingTasks'

const DashboardGrid = () => {
    const dispatch = useDispatch()

    interface RootState {
        themeStore: {
            value: boolean;
        };
    }

    const darkTheme = useSelector((store: RootState) => store.themeStore.value)

    return (
        <>
        </>
    )
}

export default DashboardGrid