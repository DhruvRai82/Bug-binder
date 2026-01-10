import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/pages/Dashboard'
import { DashboardSkeleton } from '@/components/skeletons'
import { api } from '@/lib/api'
import { DailyData } from '@/types'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async (): Promise<DailyData[]> => {
    try {
      const stored = localStorage.getItem('selectedProject')
      if (!stored) return []

      const project = JSON.parse(stored)
      return await api.get(`/api/projects/${project.id}/daily-data`)
    } catch (e) {
      console.error("Loader failed", e)
      return []
    }
  },
  pendingComponent: DashboardSkeleton,
  component: Dashboard,
})
