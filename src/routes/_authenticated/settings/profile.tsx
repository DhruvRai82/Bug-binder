import { createFileRoute } from '@tanstack/react-router'
import ProfileSettings from '@/pages/settings/ProfileSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileProfileSettings } from '@/mobile/pages/settings/ProfileSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function ProfileSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileProfileSettings />
  return <ProfileSettings />
}

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSwitcher,
  pendingComponent: FormSkeleton,
})
