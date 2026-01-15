import { createFileRoute } from '@tanstack/react-router'
import AppearanceSettings from '@/pages/settings/AppearanceSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAppearanceSettings } from '@/mobile/pages/settings/AppearanceSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function AppearanceSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileAppearanceSettings />
  return <AppearanceSettings />
}

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: AppearanceSwitcher,
  pendingComponent: FormSkeleton,
})
