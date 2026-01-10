import { createFileRoute } from '@tanstack/react-router'
import IdeLayout from '@/pages/IDE/IdeLayout'

export const Route = createFileRoute('/_authenticated/ide')({
  component: IdeLayout,
})
