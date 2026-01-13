import { createFileRoute } from '@tanstack/react-router'
import TestHub from '@/pages/TestHub'

import { DashboardSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/test-hub')({
  component: TestHub,
  pendingComponent: DashboardSkeleton,
})
