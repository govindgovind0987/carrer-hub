'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Activity, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuditLogsAction } from '@/actions/admin';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogsAction().then((res) => {
      if (res.success && Array.isArray(res.logs)) setLogs(res.logs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 text-muted-foreground">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Security Audit & Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Immutable audit trail of admin actions, role modifications, and system security events.
        </p>
      </div>

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
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold text-foreground font-mono">{log.action}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px]">
                        {log.targetType}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {log.user?.name || log.user?.email || 'System Admin'}
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
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
