import { createFileRoute } from '@tanstack/react-router'
import AccountSettings from '@/pages/settings/AccountSettings'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileAccountSettings } from '@/mobile/pages/settings/AccountSettings'
import { FormSkeleton } from '@/components/common/skeletons'

function AccountSwitcher() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileAccountSettings />
  return <AccountSettings />
}

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: AccountSwitcher,
  pendingComponent: FormSkeleton,
})
