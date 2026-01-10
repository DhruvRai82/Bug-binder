import { createFileRoute } from '@tanstack/react-router'
import TestData from '@/pages/TestData'

export const Route = createFileRoute('/_authenticated/test-data')({
  component: TestData,
})
