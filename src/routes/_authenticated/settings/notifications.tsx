import { createFileRoute } from '@tanstack/react-router'
import NotificationsSettings from '@/pages/settings/NotificationsSettings'

import { FormSkeleton } from '@/components/skeletons'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationsSettings,
  pendingComponent: FormSkeleton,
})
