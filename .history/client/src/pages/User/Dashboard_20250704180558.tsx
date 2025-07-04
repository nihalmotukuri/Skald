import Sidebar from "@/components/Sidebar"
import DashboardGrid from "@/components/DashboardGrid"

const Dashboard = () => {
  return (
    <>
      <main className="bg-[#0f111a]">
        <Sidebar />

        <DashboardGrid />
      </main>
    </>
  )
}

export default Dashboard