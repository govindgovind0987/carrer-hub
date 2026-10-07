'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Check, FileText, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickStats = [
  { label: 'Profile strength', value: '84%', color: 'bg-[#C58B32]' },
  { label: 'Applications', value: '12', color: 'bg-[#557C78]' },
  { label: 'Skills tracked', value: '18', color: 'bg-[#47677D]' },
];

export function Hero() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Your career, clearly mapped
          </div>

          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl sm:leading-[1.04] sm:tracking-[-0.055em] lg:mx-0 lg:text-[4.25rem]">
            Build a career you&apos;re <span className="text-[#A86F20] dark:text-primary">ready for.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
            Bring your resume, skills, interview practice, and job search into one calm workspace powered by practical AI guidance.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Button size="lg" asChild className="w-full sm:w-auto min-w-0 sm:min-w-44">
              <Link href={isAuthenticated ? '/dashboard' : '/sign-up'}>
                {isAuthenticated ? 'Open workspace' : 'Start building free'} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-w-0 sm:min-w-36">
              <Link href="/#features">See how it works</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            {['No credit card', 'Personalized guidance', 'Progress that stays visible'].map((item) => (
              <span key={item} className="flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DCEFE8] text-[#397A67]"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>{item}</span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-border bg-[#E7E9E7] p-2 shadow-[0_18px_45px_rgb(23_33_43/0.12)] dark:bg-card">
            <div className="grid min-h-[440px] overflow-hidden rounded-md bg-[#F8F8F6] dark:bg-background sm:grid-cols-[132px_1fr]">
              <aside className="hidden border-r border-border bg-[#E6E9E9] p-4 sm:block dark:bg-card">
                <div className="mb-8 flex items-center gap-2 text-xs font-bold text-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></span>CareerHub</div>
                <div className="space-y-2 text-[10px] font-medium text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-primary shadow-sm dark:bg-secondary"><BarChart3 className="h-3.5 w-3.5" /> Overview</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><FileText className="h-3.5 w-3.5" /> Resumes</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><Target className="h-3.5 w-3.5" /> Job matches</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><BookOpen className="h-3.5 w-3.5" /> Learning</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><BriefcaseBusiness className="h-3.5 w-3.5" /> Applications</div>
                </div>
              </aside>

              <div className="p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div><p className="text-[10px] font-medium text-muted-foreground">Good morning</p><h2 className="mt-0.5 text-base font-bold tracking-tight">Your career overview</h2></div>
                  <div className="h-8 w-8 rounded-full border-4 border-white bg-[#F1BEA2] shadow-sm dark:border-card" />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="rounded-md border border-border bg-white p-3 dark:bg-card">
                      <span className={`mb-3 block h-2 w-7 rounded-full ${stat.color}`} /><p className="text-lg font-bold tracking-tight">{stat.value}</p><p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-md border border-border bg-white p-4 dark:bg-card">
                    <div className="flex items-center justify-between"><div><p className="text-xs font-bold">Growth this month</p><p className="text-[9px] text-muted-foreground">Activity across your workspace</p></div><span className="rounded-full bg-[#E7F2EE] px-2 py-1 text-[9px] font-semibold text-[#397A67]">+18%</span></div>
                    <div className="mt-6 flex h-28 items-end justify-between gap-2 border-b border-[#EEEAF2] px-1">
                      {[44, 68, 50, 88, 64, 96, 76].map((height, index) => <div key={height + index} className="flex h-full flex-1 items-end"><div className={`w-full rounded-t-sm ${index === 5 ? 'bg-primary' : index % 2 ? 'bg-[#D7A857]' : 'bg-[#8FA1AA]'}`} style={{ height: `${height}%` }} /></div>)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#17212B] p-4 text-white dark:bg-secondary">
                    <p className="text-xs font-semibold">Next milestone</p><div className="mx-auto my-5 flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-[#C58B32] border-r-[#435B6D] text-sm font-bold">72%</div><p className="text-center text-[9px] leading-relaxed text-white/65">Complete your profile to unlock stronger matches.</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-white p-3 dark:bg-card"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><Sparkles className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold">Your weekly focus is ready</p><p className="truncate text-[9px] text-muted-foreground">Three practical steps based on your latest progress.</p></div><ArrowRight className="h-3.5 w-3.5 text-primary" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
