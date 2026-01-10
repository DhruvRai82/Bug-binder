import { createFileRoute } from '@tanstack/react-router'
import Recorder from '@/pages/Recorder'

import { DashboardSkeleton } from '@/components/skeletons'

export const Route = createFileRoute('/_authenticated/recorder')({
  component: Recorder,
  pendingComponent: DashboardSkeleton,
})
