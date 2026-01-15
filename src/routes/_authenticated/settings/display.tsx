import { createFileRoute } from '@tanstack/react-router'
import DisplaySettings from '@/pages/settings/DisplaySettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileDisplaySettings } from '@/mobile/pages/settings/DisplaySettings'
import { FormSkeleton } from '@/components/common/skeletons'

function DisplaySwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileDisplaySettings />
  return <DisplaySettings />
}

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: DisplaySwitcher,
  pendingComponent: FormSkeleton,
})
