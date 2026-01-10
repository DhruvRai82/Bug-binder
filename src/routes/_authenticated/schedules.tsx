import { createFileRoute } from '@tanstack/react-router'
import Schedules from '@/pages/Schedules'

export const Route = createFileRoute('/_authenticated/schedules')({
  component: Schedules,
})
