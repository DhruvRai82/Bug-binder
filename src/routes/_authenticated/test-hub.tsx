import { createFileRoute } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import TestHub from '@/pages/TestHub'
import MobileTestHub from '@/mobile/pages/TestHub/MobileTestHub'
import { DashboardSkeleton } from '@/components/common/skeletons'

function TestHubSwitcher() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileTestHub /> : <TestHub />
}

export const Route = createFileRoute('/_authenticated/test-hub')({
  component: TestHubSwitcher,
  pendingComponent: DashboardSkeleton,
})
