import { createFileRoute } from '@tanstack/react-router'
import AccountSettings from '@/pages/settings/AccountSettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: AccountSettings,
  pendingComponent: FormSkeleton,
})
