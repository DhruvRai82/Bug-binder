import { createFileRoute } from '@tanstack/react-router'
import AppearanceSettings from '@/pages/settings/AppearanceSettings'

import { FormSkeleton } from '@/components/skeletons'

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: AppearanceSettings,
  pendingComponent: FormSkeleton,
})
