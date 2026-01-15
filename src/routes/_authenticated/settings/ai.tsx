import { createFileRoute } from '@tanstack/react-router'
import AISettings from '@/pages/settings/AISettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAISettings } from '@/mobile/pages/settings/AISettings'
import { FormSkeleton } from '@/components/common/skeletons'

function AISettingsSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileAISettings />
  return <AISettings />
}

export const Route = createFileRoute('/_authenticated/settings/ai')({
  component: AISettingsSwitcher,
  pendingComponent: FormSkeleton,
})
