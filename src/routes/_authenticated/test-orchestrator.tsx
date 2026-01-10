import { createFileRoute } from '@tanstack/react-router'
import TestOrchestrator from '@/pages/TestOrchestrator'

export const Route = createFileRoute('/_authenticated/test-orchestrator')({
  component: TestOrchestrator,
})
