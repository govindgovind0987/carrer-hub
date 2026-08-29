'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Search,
  UserX,
  UserCheck,
  Trash2,
  ShieldAlert,
  Loader2,
  Filter,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suspendUserAction, deleteUserAction, getAdminAnalyticsAction } from '@/actions/admin';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    getAdminAnalyticsAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.analytics?.recentUsers) {
        setUsers(res.analytics.recentUsers);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSuspend = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    toast.loading(`Updating user status to ${nextStatus}...`, { id: 'usr-status' });
    const res = await suspendUserAction(userId, nextStatus);

    if (res.success) {
      toast.success(`User status updated to ${nextStatus}`, { id: 'usr-status' });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } else {
      toast.error(res.error || 'Failed to update user', { id: 'usr-status' });
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;

    toast.loading('Deleting user account...', { id: 'del-usr' });
    const res = await deleteUserAction(userId);

    if (res.success) {
      toast.success('User account deleted', { id: 'del-usr' });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      toast.error(res.error || 'Failed to delete user', { id: 'del-usr' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 text-muted-foreground">
            <Link href="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">User Account Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Governance, suspend accounts, assign roles, and audit candidate/recruiter profiles.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-background text-xs">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="CANDIDATE">Candidate</SelectItem>
                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="text-xs font-mono py-2 px-3">
              {filteredUsers.length} Users Found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50 bg-card overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase border-b border-border/50 font-semibold">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-foreground block">{u.name || 'User'}</span>
                        <span className="font-mono text-muted-foreground text-[11px]">{u.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={u.role === 'RECRUITER' ? 'default' : u.role === 'ADMIN' ? 'destructive' : 'outline'}
                        className="text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          u.status === 'SUSPENDED'
                            ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {u.status || 'ACTIVE'}
                      </Badge>
                    </td>

                    <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(u.id, u.status)}
                          className={u.status === 'SUSPENDED' ? 'text-emerald-600' : 'text-amber-600'}
                        >
                          {u.status === 'SUSPENDED' ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Reactivate
                            </>
                          ) : (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1" /> Suspend
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
