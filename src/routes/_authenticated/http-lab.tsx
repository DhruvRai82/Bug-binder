import { createFileRoute } from '@tanstack/react-router'
import APILab from '@/pages/APILab'

export const Route = createFileRoute('/_authenticated/http-lab')({
  component: APILab,
})
