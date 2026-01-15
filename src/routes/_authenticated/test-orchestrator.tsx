import { createFileRoute } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import TestOrchestrator from '@/pages/TestOrchestrator'
import MobileTestOrchestrator from '@/mobile/pages/TestOrchestrator/MobileTestOrchestrator'
import { DashboardSkeleton } from '@/components/common/skeletons'

function OrchestratorSwitcher() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileTestOrchestrator /> : <TestOrchestrator />
}

export const Route = createFileRoute('/_authenticated/test-orchestrator')({
  component: OrchestratorSwitcher,
  pendingComponent: DashboardSkeleton,
})
