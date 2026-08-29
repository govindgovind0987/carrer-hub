'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Building2, CheckCircle2, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { approveRecruiterAction, verifyCompanyAction } from '@/actions/admin';

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([
    {
      id: 'rec_1',
      name: 'Sarah Miller',
      email: 'sarah@techcorp.com',
      company: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      isVerified: false,
      status: 'PENDING_VERIFICATION',
      submittedAt: '2026-07-20',
    },
    {
      id: 'rec_2',
      name: 'Michael Chen',
      email: 'm.chen@innovate.io',
      company: 'Innovate AI Labs',
      website: 'https://innovate.io',
      isVerified: true,
      status: 'ACTIVE',
      submittedAt: '2026-07-18',
    },
  ]);

  const handleApprove = async (id) => {
    toast.loading('Approving recruiter access...', { id: 'appr-rec' });
    const res = await approveRecruiterAction(id);
    if (res.success) {
      toast.success('Recruiter account approved and verified!', { id: 'appr-rec' });
      setRecruiters((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'ACTIVE', isVerified: true } : r))
      );
    } else {
      toast.error('Failed to approve recruiter', { id: 'appr-rec' });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 text-muted-foreground">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Recruiter & Company Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify corporate hiring credentials, approve recruiter posting privileges, and issue verified badges.
        </p>
      </div>

      <div className="space-y-4">
        {recruiters.map((r) => (
          <Card key={r.id} className="border-border/50 bg-card">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{r.company}</span>
                  {r.isVerified ? (
                    <Badge variant="default" className="bg-emerald-600 text-white text-[10px]">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Verified Company
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/10">
                      Pending Verification
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recruiter Contact: <strong>{r.name}</strong> ({r.email})
                </p>
                <a href={r.website} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline flex items-center gap-1 pt-1">
                  {r.website} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!r.isVerified && (
                  <Button onClick={() => handleApprove(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve & Verify
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
