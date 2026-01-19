import { createFileRoute } from '@tanstack/react-router'
import SpeedLab from '@/pages/Performance/SpeedLab'
import MobileSpeedLab from '@/mobile/pages/Performance/MobileSpeedLab'
import { useIsMobile } from '@/hooks/use-mobile'
import { SpeedLabSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/speed-lab')({
  pendingComponent: SpeedLabSkeleton,
  component: SpeedLabPage,
})

function SpeedLabPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileSpeedLab />;
  return <SpeedLab />;
}
