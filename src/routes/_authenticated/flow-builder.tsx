import { createFileRoute } from '@tanstack/react-router'
import { FlowBuilder } from "@/features/builder/FlowBuilder"
import { useNavigationLock } from "@/contexts/NavigationLockContext"
import { useIsMobile } from '@/hooks/use-mobile'
import MobileFlowBuilder from '@/mobile/pages/FlowBuilder/MobileFlowBuilder'

export const Route = createFileRoute('/_authenticated/flow-builder')({
    component: FlowBuilderPage,
})

function FlowBuilderPage() {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <MobileFlowBuilder />
    }

    return <DesktopFlowBuilder />
}

function DesktopFlowBuilder() {
    const { setNavLocked } = useNavigationLock()

    return (
        <div className="h-full w-full">
            <FlowBuilder
                onEditorActive={(isActive) => {
                    setNavLocked(isActive);
                }}
            />
        </div>
    )
}
