import { createFileRoute } from '@tanstack/react-router'
import VisualTests from '@/pages/VisualTests'

export const Route = createFileRoute('/_authenticated/visual-tests')({
  component: VisualTests,
})
