import { createFileRoute } from '@tanstack/react-router'
import ProfileSettings from '@/pages/settings/ProfileSettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettings,
  pendingComponent: FormSkeleton,
})
