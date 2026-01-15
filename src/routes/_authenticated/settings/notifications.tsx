import { createFileRoute } from '@tanstack/react-router'
import NotificationsSettings from '@/pages/settings/NotificationsSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileNotificationsSettings } from '@/mobile/pages/settings/NotificationsSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function NotificationsSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileNotificationsSettings />
  return <NotificationsSettings />
}

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationsSwitcher,
  pendingComponent: FormSkeleton,
})
