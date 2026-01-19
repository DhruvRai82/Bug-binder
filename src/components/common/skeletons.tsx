import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="h-full overflow-auto p-6 space-y-6">
            {/* Header Area */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-muted/20" />
                <Skeleton className="h-4 w-96 bg-muted/20" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="shadow-sm border bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24 bg-muted/20" />
                            <Skeleton className="h-8 w-8 rounded-full bg-muted/20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-12 mb-1 bg-muted/20" />
                            <Skeleton className="h-3 w-20 bg-muted/20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] w-full rounded-xl bg-muted/10" />
                <Skeleton className="h-[300px] w-full rounded-xl bg-muted/10" />
            </div>
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="p-6 h-full flex flex-col space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center h-10">
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-64 bg-muted/20" />
                    <Skeleton className="h-9 w-24 bg-muted/20" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 bg-muted/20" />
                    <Skeleton className="h-9 w-32 bg-muted/20" />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="h-10 border-b bg-muted/10 flex items-center px-4 gap-4">
                    <Skeleton className="h-4 w-4 bg-muted/20" />
                    <Skeleton className="h-4 w-32 bg-muted/20" />
                    <Skeleton className="h-4 w-32 bg-muted/20" />
                    <Skeleton className="h-4 w-32 ml-auto bg-muted/20" />
                </div>
                {/* Rows */}
                <div className="flex-1 p-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex items-center h-12 px-4 border-b last:border-0 gap-4">
                            <Skeleton className="h-4 w-4 bg-muted/20" />
                            <Skeleton className="h-4 w-48 bg-muted/20" />
                            <Skeleton className="h-4 w-24 bg-muted/20" />
                            <Skeleton className="h-4 w-32 ml-auto bg-muted/20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            {/* Form Header */}
            <div className="space-y-2 border-b pb-6">
                <Skeleton className="h-8 w-48 bg-muted/20" />
                <Skeleton className="h-4 w-full max-w-lg bg-muted/20" />
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
                {[1, 2].map((i) => (
                    <div key={i} className="grid gap-6 p-6 border rounded-lg bg-card/30">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-muted/20" />
                            <div className="flex gap-4 items-center">
                                <Skeleton className="h-16 w-16 rounded-full bg-muted/20" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full max-w-sm bg-muted/20" />
                                    <Skeleton className="h-4 w-64 bg-muted/20" />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="h-4 w-24 bg-muted/20" />
                            <Skeleton className="h-10 w-full bg-muted/10" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32 bg-muted/20" />
            </div>
        </div>
    )
}

export function SpeedLabSkeleton() {
    return (
        <div className="h-full flex gap-6 p-6 max-w-[1600px] mx-auto w-full animate-pulse">
            <div className="flex-1 flex flex-col space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-md bg-muted/20" />
                    <Skeleton className="h-5 w-96 rounded-md bg-muted/20" />
                </div>

                {/* Input Bar */}
                <div className="h-16 rounded-xl bg-muted/10 w-full" />

                {/* Gauges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-muted/10" />
                    ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 rounded-xl bg-muted/10 col-span-1" />
                    <div className="h-64 rounded-xl bg-muted/10 col-span-2" />
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="w-[300px] border-l pl-6 space-y-4">
                <Skeleton className="h-6 w-32 bg-muted/20" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg bg-muted/10" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function AppLoadingSkeleton() {
    return (
        <div className="h-screen w-full flex overflow-hidden bg-background">
            {/* Sidebar Skeleton - Clean outline */}
            <div className="w-[19rem] h-full border-r bg-sidebar p-2 flex flex-col gap-2 hidden md:flex">
                <div className="h-14 border-b px-4 flex items-center mb-2">
                    <Skeleton className="h-8 w-8 rounded-lg bg-muted/20 mr-3" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32 bg-muted/20" />
                        <Skeleton className="h-2 w-20 bg-muted/20" />
                    </div>
                </div>
                <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted/10" />
                    ))}
                </div>
            </div>

            {/* Main Content - Minimalist Spinner */}
            <div className="flex-1 flex flex-col h-full relative">
                <div className="h-14 border-b flex items-center justify-between px-4">
                    <Skeleton className="h-8 w-48 bg-muted/10 rounded" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full bg-muted/10" />
                        <Skeleton className="h-8 w-8 rounded-full bg-muted/10" />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                            <Skeleton className="h-6 w-6 rounded-full bg-blue-500/40" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Loading Workspace...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
