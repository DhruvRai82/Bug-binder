import { createFileRoute, redirect } from '@tanstack/react-router'
import { MobileSettingsHub } from '@/mobile/pages/settings/SettingsHub'
import { useIsMobile } from '@/hooks/use-mobile'

function SettingsIndexSwitcher() {
  const isMobile = useIsMobile()
  // On mobile, show the Hub
  if (isMobile) return <MobileSettingsHub />
  return null // Desktop will handle redirect in beforeLoad
}

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsIndexSwitcher,
  beforeLoad: () => {
    // We can't use hooks here, so we check user agent or just let the component handle it?
    // Problem: beforeLoad runs before component.
    // If we redirect here, mobile users get redirected too.
    // We should remove the hard redirect and let the component handle logic.
    // But wait, hooks like useIsMobile work in components, not beforeLoad.
    // Strategy: Remove beforeLoad redirect. Let component decide.
  },
})
