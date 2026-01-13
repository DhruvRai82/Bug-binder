import { createFileRoute } from '@tanstack/react-router'
import GitSettings from '@/pages/settings/GitSettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/git')({
  component: GitSettings,
  pendingComponent: FormSkeleton,
})
