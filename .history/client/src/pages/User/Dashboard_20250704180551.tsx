import Sidebar from "@/components/Sidebar"

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