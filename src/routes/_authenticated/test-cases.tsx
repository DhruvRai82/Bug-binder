import { createFileRoute } from '@tanstack/react-router'
import TestCases from '@/pages/TestCases'
import { TableSkeleton } from '@/components/common/skeletons'
import { api } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileTestCases } from '@/mobile/pages/TestCases'

export const Route = createFileRoute('/_authenticated/test-cases')({
  loader: async () => {
    try {
      const stored = localStorage.getItem('selectedProject')
      if (!stored) return { pages: [], initialData: [] }

      const project = JSON.parse(stored)
      const pages = await api.get(`/api/projects/${project.id}/pages`)

      let initialData = []
      if (Array.isArray(pages) && pages.length > 0) {
        const firstPage = pages[0]
        try {
          // Pre-fetch data for the first page
          initialData = await api.get(`/api/projects/${project.id}/daily-data?date=${firstPage.date}`)
        } catch (e) {
          console.warn("Failed to pre-fetch daily data", e)
        }
      }

      return { pages: Array.isArray(pages) ? pages : [], initialData }
    } catch (e) {
      console.error("Loader failed", e)
      return { pages: [], initialData: [] }
    }
  },
  pendingComponent: TableSkeleton,
  component: TestCasesRoute,
})

function TestCasesRoute() {
  const stored = localStorage.getItem('selectedProject')
  const selectedProject = stored ? JSON.parse(stored) : null
  const isMobile = useIsMobile()

  if (!selectedProject) return <div>Please select a project.</div>

  if (isMobile) return <MobileTestCases />

  return <TestCases selectedProject={selectedProject} />
}
