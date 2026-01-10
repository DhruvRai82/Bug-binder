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
