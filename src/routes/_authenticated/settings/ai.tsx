import { createFileRoute } from '@tanstack/react-router'
import AISettings from '@/pages/settings/AISettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/ai')({
  component: AISettings,
  pendingComponent: FormSkeleton,
})
