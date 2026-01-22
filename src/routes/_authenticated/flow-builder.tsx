import { createFileRoute } from '@tanstack/react-router'
import { FlowBuilder } from "@/features/builder/FlowBuilder"
import { useNavigationLock } from "@/contexts/NavigationLockContext"
import { useEffect } from "react"

export const Route = createFileRoute('/_authenticated/flow-builder')({
    component: FlowBuilderPage,
})

function FlowBuilderPage() {
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
