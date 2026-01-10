import { createFileRoute } from '@tanstack/react-router'
import DatabaseView from '@/pages/DatabaseView'

export const Route = createFileRoute('/_authenticated/database')({
  component: DatabaseView,
})
