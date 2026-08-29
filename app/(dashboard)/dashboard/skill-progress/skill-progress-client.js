'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Globe,
  Database,
  Cpu,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const ALL_DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Linked List',
  'Stack',
  'Queue',
  'Trees',
  'Graphs',
  'Heap',
  'Greedy',
  'Backtracking',
  'Dynamic Programming',
  'Bit Manipulation',
  'Trie',
  'Union Find',
  'Segment Tree',
];

export default function SkillProgressClient({
  userProgress = [],
  submissions = [],
  codingStats = null,
  interviewSessions = [],
  latestAnalysis = null,
  profile = null,
}) {
  const [activeTab, setActiveTab] = useState('dsa');

  // Compute stats for all 20 DSA Topics
  const dsaTopicData = ALL_DSA_TOPICS.map((topic) => {
    // Filter progress entries related to this topic
    const progressInTopic = userProgress.filter((up) => {
      const cat = up.problem?.category || '';
      const tags = up.problem?.tags || [];
      return cat.toLowerCase() === topic.toLowerCase() || tags.some((t) => t.toLowerCase() === topic.toLowerCase());
    });

    // Filter submissions for this topic
    const subsInTopic = submissions.filter((sub) => {
      const cat = sub.problem?.category || '';
      const tags = sub.problem?.tags || [];
      return cat.toLowerCase() === topic.toLowerCase() || tags.some((t) => t.toLowerCase() === topic.toLowerCase());
    });

    const solvedInTopic = progressInTopic.filter((p) => p.status === 'SOLVED');

    const easySolved = solvedInTopic.filter((p) => p.problem.difficulty === 'EASY').length;
    const mediumSolved = solvedInTopic.filter((p) => p.problem.difficulty === 'MEDIUM').length;
    const hardSolved = solvedInTopic.filter((p) => p.problem.difficulty === 'HARD').length;

    const attemptedCount = Math.max(progressInTopic.length, subsInTopic.length);
    const solvedCount = solvedInTopic.length;

    const acceptedSubs = subsInTopic.filter((s) => s.verdict === 'ACCEPTED').length;
    const totalSubs = subsInTopic.length;
    const successRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

    const lastSub = subsInTopic[0]?.createdAt || progressInTopic[0]?.lastSubmittedAt || null;

    // Skill level calculation
    let skillLevel = 'Beginner';
    if (solvedCount >= 15 || (solvedCount >= 8 && successRate >= 80)) {
      skillLevel = 'Mastered';
    } else if (solvedCount >= 8) {
      skillLevel = 'Strong';
    } else if (solvedCount >= 4) {
      skillLevel = 'Intermediate';
    } else if (solvedCount >= 1) {
      skillLevel = 'Learning';
    }

    return {
      topic,
      attemptedCount,
      solvedCount,
      easySolved,
      mediumSolved,
      hardSolved,
      successRate,
      recentActivity: lastSub ? new Date(lastSub).toLocaleDateString() : 'No recent activity',
      skillLevel,
    };
  });

  const totalDsaSolved = codingStats?.solvedCount ?? userProgress.filter((p) => p.status === 'SOLVED').length;
  const totalDsaAttempted = userProgress.length;

  // Language Breakdown from Submissions
  const langCounts = {};
  submissions.forEach((s) => {
    const l = s.language?.toLowerCase() || 'python';
    langCounts[l] = (langCounts[l] || 0) + 1;
  });

  // Web Dev & DB Skills from Profile
  const profileSkills = profile?.skills || [];
  const webDevSkills = profileSkills.filter((s) =>
    /react|next|node|javascript|html|css|tailwind|vue|angular/i.test(s.name)
  );
  const dbSkills = profileSkills.filter((s) =>
    /sql|mongo|postgres|redis|database|prisma|dynamo/i.test(s.name)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Skill Progress Analytics</h1>
            <Badge variant="secondary" className="text-[10px]">20 DSA Topics</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Monitor your skill levels, accuracy rates, and solved metrics across 20 Data Structures & Algorithms topics, programming languages, and interview readiness.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild size="sm">
            <Link href="/dashboard/assessment">
              <Code2 className="mr-2 h-3.5 w-3.5" /> Practice Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="dsa" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto bg-card p-1 border border-border rounded-lg gap-1">
          <TabsTrigger value="dsa" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Code2 className="h-3.5 w-3.5" /> DSA
          </TabsTrigger>
          <TabsTrigger value="programming" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Terminal className="h-3.5 w-3.5" /> Programming
          </TabsTrigger>
          <TabsTrigger value="webdev" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Globe className="h-3.5 w-3.5" /> Web Development
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Database className="h-3.5 w-3.5" /> Database
          </TabsTrigger>
          <TabsTrigger value="cs" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Cpu className="h-3.5 w-3.5" /> Computer Science
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <HelpCircle className="h-3.5 w-3.5" /> Interview Prep
          </TabsTrigger>
          <TabsTrigger value="resume" className="flex items-center gap-1.5 text-xs py-1.5 px-3">
            <FileCheck className="h-3.5 w-3.5" /> Resume / Career
          </TabsTrigger>
        </TabsList>

        {/* 1. DSA TAB CONTENT */}
        <TabsContent value="dsa" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Data Structures & Algorithms Breakdown</h2>
              <p className="text-xs text-muted-foreground">
                Detailed stats across all 20 essential DSA topic categories.
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-semibold text-foreground">{totalDsaSolved}</span>
              <span className="text-muted-foreground"> / {totalDsaAttempted} Topics Attempted</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dsaTopicData.map((t) => (
              <Card
                key={t.topic}
                className="flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        t.skillLevel === 'Mastered'
                          ? 'success'
                          : t.skillLevel === 'Strong'
                          ? 'info'
                          : t.skillLevel === 'Intermediate'
                          ? 'secondary'
                          : t.skillLevel === 'Learning'
                          ? 'warning'
                          : 'outline'
                      }
                    >
                      {t.skillLevel}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.recentActivity}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold text-foreground mt-2">{t.topic}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Attempted</p>
                      <p className="font-semibold text-foreground">{t.attemptedCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Solved</p>
                      <p className="font-semibold text-foreground">{t.solvedCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600">E:{t.easySolved}</span>
                      <span className="text-amber-600">M:{t.mediumSolved}</span>
                      <span className="text-rose-600">H:{t.hardSolved}</span>
                    </div>
                    <span className="font-medium text-muted-foreground">{t.successRate}% Acc</span>
                  </div>

                  <Progress value={t.solvedCount > 0 ? Math.min(100, t.solvedCount * 20) : 0} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 2. PROGRAMMING TAB CONTENT */}
        <TabsContent value="programming" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-500" /> Programming Languages & Execution History
              </CardTitle>
              <CardDescription className="text-xs">
                Real code submission execution frequency per supported programming language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(langCounts).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start practicing to build your progress. No language submissions found.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {Object.entries(langCounts).map(([lang, count]) => (
                    <div key={lang} className="p-4 rounded-xl border border-border/50 bg-card/60 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground uppercase">{lang}</p>
                        <p className="text-xs text-muted-foreground">{count} submissions executed</p>
                      </div>
                      <Badge className="bg-indigo-600 text-white">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. WEB DEVELOPMENT TAB CONTENT */}
        <TabsContent value="webdev" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" /> Web Development Stack
              </CardTitle>
              <CardDescription className="text-xs">
                Frontend, backend, and framework competencies detected in your profile & experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webDevSkills.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start practicing to build your progress. Add web development skills in your Profile.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {webDevSkills.map((sk) => (
                    <Badge key={sk.id} variant="secondary" className="px-3 py-1.5 text-xs">
                      {sk.name} • {sk.level}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. DATABASE TAB CONTENT */}
        <TabsContent value="database" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-500" /> Database & Storage Mastery
              </CardTitle>
              <CardDescription className="text-xs">
                Relational SQL & NoSQL database competencies registered in your candidate profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dbSkills.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start practicing to build your progress. Add database skills to your Profile.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dbSkills.map((sk) => (
                    <Badge key={sk.id} variant="outline" className="px-3 py-1.5 text-xs border-amber-500/30 text-amber-500">
                      {sk.name} • {sk.level}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. COMPUTER SCIENCE TAB CONTENT */}
        <TabsContent value="cs" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-500" /> Core Computer Science Fundamentals
              </CardTitle>
              <CardDescription className="text-xs">
                System Design, Operating Systems, Networking, and OOP concepts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-sm text-muted-foreground">
                Start practicing to build your progress. Practice technical questions in HR & Tech Questions module.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. INTERVIEW PREPARATION TAB CONTENT */}
        <TabsContent value="interview" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-rose-500" /> Interview Preparation Performance
              </CardTitle>
              <CardDescription className="text-xs">
                Mock technical interviews and verbal answer evaluations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interviewSessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start practicing to build your progress. No mock interviews taken yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {interviewSessions.map((session) => (
                    <div key={session.id} className="p-3 rounded-lg border border-border/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{session.role} ({session.technology})</p>
                        <p className="text-muted-foreground">{session.type} • {session.status}</p>
                      </div>
                      <Badge variant="outline" className="border-rose-500/30 text-rose-500">
                        {session.report?.overallScore ? `${session.report.overallScore}/100` : session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. RESUME / CAREER TAB CONTENT */}
        <TabsContent value="resume" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-cyan-500" /> Resume Audit & Career Readiness
              </CardTitle>
              <CardDescription className="text-xs">
                ATS parsing score and keyword optimization status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!latestAnalysis ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start practicing to build your progress. Upload and audit your resume in AI Resume Score.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
                      <p className="text-xs text-muted-foreground">ATS Score</p>
                      <p className="text-2xl font-bold text-cyan-500">{latestAnalysis.atsScore}/100</p>
                    </div>
                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                      <p className="text-2xl font-bold text-violet-500">{latestAnalysis.overallScore}/100</p>
                    </div>
                  </div>
                  {latestAnalysis.missingSkills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">Missing High-Value Keywords:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {latestAnalysis.missingSkills.map((sk, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-rose-500/30 text-rose-500">
                            {sk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
