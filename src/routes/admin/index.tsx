import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">56</p>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold">System Health</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">98%</p>
        </div>
      </div>
    </div>
  )
}
