import { createFileRoute } from '@tanstack/react-router'
import Bugs from '@/pages/Bugs'
import { TableSkeleton } from '@/components/common/skeletons'
import { api } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/bugs')({
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
          // Pre-fetch data for the first page to avoid second loading spinner
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
  component: BugsRoute,
})

function BugsRoute() {
  // We can access loader data here or pass it? 
  // Bugs component expects `selectedProject` prop currently.
  // We should probably update Bugs component to consume loader data too, 
  // OR pass it down. 
  // Let's pass it down if we modify Bugs component signature, 
  // OR just let Bugs component use Route.useLoaderData()

  // Current Bugs component needs selectedProject prop.
  // We can get it from localStorage (hack) or context if context was working ideally 
  // but context is inside component tree so component CAN access it.

  // We will modify Bugs component to use useLoaderData, 
  // so we just render it here.

  // We still need to pass selectedProject because Bugs uses it for mutations.
  // The context works fine inside the component.

  const stored = localStorage.getItem('selectedProject')
  const selectedProject = stored ? JSON.parse(stored) : null

  if (!selectedProject) return <div>Please select a project.</div>

  return <Bugs selectedProject={selectedProject} />
}
