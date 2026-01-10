import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
})

function AdminSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <p>System configuration will go here.</p>
    </div>
  )
}
