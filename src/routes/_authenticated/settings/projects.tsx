import { createFileRoute } from '@tanstack/react-router'
import ProjectSettings from '@/pages/settings/ProjectSettings'

import { FormSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated/settings/projects')({
  component: ProjectSettings,
  pendingComponent: FormSkeleton,
})
