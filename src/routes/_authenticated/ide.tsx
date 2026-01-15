import { createFileRoute } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import IdeLayout from '@/pages/IDE/IdeLayout'
import MobileDevStudio from '@/mobile/pages/DevStudio/MobileDevStudio'
import { DashboardSkeleton } from '@/components/common/skeletons'

function IdeSwitcher() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileDevStudio /> : <IdeLayout />
}

export const Route = createFileRoute('/_authenticated/ide')({
  component: IdeSwitcher,
  pendingComponent: DashboardSkeleton,
})
