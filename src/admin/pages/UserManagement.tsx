import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from '@/lib/api';

interface UserData {
    email: string;
    role: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);

    useEffect(() => {
        api.get('/api/admin/users').then(setUsers).catch(console.error);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage system access and roles</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.email}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                            Active
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
