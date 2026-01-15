import { createFileRoute } from '@tanstack/react-router'
import ProjectSettings from '@/pages/settings/ProjectSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileProjectSettings } from '@/mobile/pages/settings/ProjectSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function ProjectsSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileProjectSettings />
  return <ProjectSettings />
}

export const Route = createFileRoute('/_authenticated/settings/projects')({
  component: ProjectsSwitcher,
  pendingComponent: FormSkeleton,
})
