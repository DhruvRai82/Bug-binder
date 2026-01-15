import { createFileRoute } from '@tanstack/react-router'
import GitSettings from '@/pages/settings/GitSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileGitSettings } from '@/mobile/pages/settings/GitSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function GitSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileGitSettings />
  return <GitSettings />
}

export const Route = createFileRoute('/_authenticated/settings/git')({
  component: GitSwitcher,
  pendingComponent: FormSkeleton,
})
