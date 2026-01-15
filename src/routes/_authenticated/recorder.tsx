import { createFileRoute } from '@tanstack/react-router'
import Recorder from '@/pages/Recorder'
import { MobileRecorder } from '@/mobile/pages/Recorder'
import { useIsMobile } from '@/hooks/use-mobile'
import { DashboardSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/recorder')({
  component: RecorderRoute,
  pendingComponent: DashboardSkeleton,
})

function RecorderRoute() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileRecorder />
  }

  return <Recorder />
}
