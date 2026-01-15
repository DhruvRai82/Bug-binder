import { createFileRoute } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import APILab from '@/pages/APILab'
import MobileAPILab from '@/mobile/pages/APILab/MobileAPILab'
import { DashboardSkeleton } from '@/components/common/skeletons'

function APILabSwitcher() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileAPILab /> : <APILab />
}

export const Route = createFileRoute('/_authenticated/http-lab')({
  component: APILabSwitcher,
  pendingComponent: DashboardSkeleton,
})
