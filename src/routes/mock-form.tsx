import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, UserPlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute('/mock-form')({
    component: MockFormPage,
})

function MockFormPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'user',
        notes: ''
    })

    const [submissions, setSubmissions] = useState<any[]>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.fullName || !formData.email) {
            toast.error("Please fill in required fields")
            return
        }

        const newSubmission = {
            id: Date.now(),
            ...formData,
            timestamp: new Date().toLocaleTimeString()
        }

        setSubmissions(prev => [newSubmission, ...prev])
        toast.success(`User ${formData.fullName} added!`)

        // Reset form
        setFormData({
            fullName: '',
            email: '',
            role: 'user',
            notes: ''
        })
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Automation Test Bench</h1>
                <p className="text-muted-foreground">
                    Use this page to test your Loops and Mock Data Injection.
                    IDs are consistent: <code className="bg-muted px-1 rounded">#input-name</code>, <code className="bg-muted px-1 rounded">#input-email</code>, <code className="bg-muted px-1 rounded">#btn-submit</code>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FORM CARD */}
                <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            User Registration Form
                        </CardTitle>
                        <CardDescription>Target this form with your automation script</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="input-name">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="input-name"
                                    placeholder="e.g. John Doe"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    data-testid="name-field"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="input-email">Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    id="input-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    data-testid="email-field"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="select-role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={v => setFormData({ ...formData, role: v })}
                                >
                                    <SelectTrigger id="select-role" data-testid="role-select">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="user">Standard User</SelectItem>
                                        <SelectItem value="viewer">Read-Only Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" id="btn-submit" className="w-full" size="lg">
                                    <Save className="h-4 w-4 mr-2" />
                                    Submit Record
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* RESULTS CARD */}
                <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm flex flex-col h-[500px]">
                    <CardHeader className="bg-secondary/10 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Live Submissions</CardTitle>
                            <CardDescription>Records appear here instantly</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-background">{submissions.length} Records</Badge>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto flex-1">
                        {submissions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 p-8 text-center">
                                <div className="border-2 border-dashed border-current rounded-xl p-4 mb-3">
                                    <Save className="h-8 w-8" />
                                </div>
                                <p>No data submitted yet.</p>
                                <p className="text-xs">Run your loop to populate this table.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow key={sub.id} className="animate-in slide-in-from-top-2">
                                            <TableCell className="font-mono text-xs">{sub.timestamp}</TableCell>
                                            <TableCell className="font-medium">{sub.fullName}</TableCell>
                                            <TableCell>{sub.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="uppercase text-[10px]">{sub.role}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    {submissions.length > 0 && (
                        <div className="p-4 border-t bg-muted/5">
                            <Button variant="outline" size="sm" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setSubmissions([])}>
                                <Trash2 className="h-4 w-4 mr-2" /> Clear All Records
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
