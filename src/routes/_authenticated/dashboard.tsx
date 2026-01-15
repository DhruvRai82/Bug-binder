import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/pages/Dashboard'
import { DashboardSkeleton } from '@/components/common/skeletons'
import { api } from '@/lib/api'
import { DailyData } from '@/types'

import { useIsMobile } from '@/hooks/use-mobile'
import { MobileDashboard } from '@/mobile/pages/Dashboard'

function DashboardSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileDashboard />
  return <Dashboard />
}

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
  component: DashboardSwitcher,
})
