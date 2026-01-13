import { createFileRoute } from '@tanstack/react-router'
import DisplaySettings from '@/pages/settings/DisplaySettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: DisplaySettings,
  pendingComponent: FormSkeleton,
})
