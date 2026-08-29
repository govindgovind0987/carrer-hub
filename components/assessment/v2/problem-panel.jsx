'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SampleTestcasesBrowser } from './sample-testcases-browser';
import { SubmissionsTable } from './submissions-table';
import { AIAssistantDrawer } from '../ai-assistant-drawer';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BookOpen,
  Lightbulb,
  FileText,
  History,
  MessageSquare,
  Code2,
  Bookmark,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Tag,
  Building2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProblemPanel({
  problem,
  userProgress,
  submissions = [],
  similarProblems = {},
  code = '',
  language = 'python',
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('description');
  const [bookmarked, setBookmarked] = useState(userProgress?.bookmarked || false);
  const [unlockedHints, setUnlockedHints] = useState(new Set());
  const [unlockedEditorial, setUnlockedEditorial] = useState(false);

  const handleToggleBookmark = async () => {
    const nextVal = !bookmarked;
    setBookmarked(nextVal);
    try {
      await fetch('/api/assessment/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, bookmarked: nextVal }),
      });
      toast.success(nextVal ? 'Problem bookmarked!' : 'Bookmark removed');
    } catch (_) {}
  };

  const handleTopicClick = (topic) => {
    router.push(`/dashboard/assessment?category=${encodeURIComponent(topic)}`);
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'EASY')
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Easy</Badge>;
    if (diff === 'MEDIUM')
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Medium</Badge>;
    return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30">Hard</Badge>;
  };

  const sameTopic = similarProblems.sameTopic || [];
  const sameDifficulty = similarProblems.sameDifficulty || [];
  const nextProblem = similarProblems.recommendedNext;
  const prevSlug = similarProblems.prevSlug;
  const nextSlug = similarProblems.nextSlug;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col h-full">
      {/* Problem Header Bar */}
      <div className="p-4 border-b border-border/50 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{problem.title}</h1>
            {getDifficultyBadge(problem.difficulty)}
            <Badge
              onClick={() => handleTopicClick(problem.category)}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted font-mono"
            >
              {problem.category}
            </Badge>
          </div>

          <Button
            variant={bookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleBookmark}
            className="text-xs"
          >
            <Bookmark className={`h-3.5 w-3.5 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono flex-wrap">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Acceptance: <strong className="text-foreground">{problem.acceptanceRate || 68.4}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-violet-500" /> Solved: <strong className="text-foreground">{problem.acceptedSubmissions || 0} / {problem.totalSubmissions || 0}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500" /> Avg Runtime: <strong className="text-foreground">{problem.averageRuntimeMs || 42} ms</strong>
          </span>
        </div>

        {/* Companies & Topics Badges Row */}
        <div className="flex items-center gap-3 text-xs flex-wrap pt-1 border-t border-border/40">
          {problem.companyTags && problem.companyTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-sans text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3 text-amber-500" /> Companies:
              </span>
              {problem.companyTags.map((comp, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2 font-mono">
                  {comp}
                </Badge>
              ))}
            </div>
          )}

          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-sans text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3 text-violet-500" /> Topics:
              </span>
              {problem.tags.map((t, idx) => (
                <Badge
                  key={idx}
                  onClick={() => handleTopicClick(t)}
                  className="bg-violet-500/10 text-violet-600 border-violet-500/30 hover:bg-violet-500/20 text-[10px] py-0 px-2 cursor-pointer font-mono"
                >
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-border/40 bg-muted/30 px-3 py-1.5">
        <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex h-auto gap-1 bg-muted/60 p-1">
            <TabsTrigger value="description" className="text-xs py-1 px-2.5">
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Description
            </TabsTrigger>
            <TabsTrigger value="hints" className="text-xs py-1 px-2.5">
              <Lightbulb className="h-3.5 w-3.5 mr-1" /> Hints
            </TabsTrigger>
            <TabsTrigger value="editorial" className="text-xs py-1 px-2.5">
              <FileText className="h-3.5 w-3.5 mr-1" /> Editorial
            </TabsTrigger>
            <TabsTrigger value="solutions" className="text-xs py-1 px-2.5">
              <Code2 className="h-3.5 w-3.5 mr-1" /> Solutions
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs py-1 px-2.5">
              <History className="h-3.5 w-3.5 mr-1" /> Submissions
            </TabsTrigger>
            <TabsTrigger value="discussion" className="text-xs py-1 px-2.5">
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Discussion
            </TabsTrigger>
            <TabsTrigger value="ai-copilot" className="text-xs py-1 px-2.5 text-violet-600 font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-violet-500 fill-violet-500" /> AI Copilot
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Tab Content Body */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {/* Tab: AI Copilot */}
        {activeTab === 'ai-copilot' && (
          <AIAssistantDrawer
            code={code}
            language={language}
            problemTitle={problem.title}
            problemDescription={problem.description}
          />
        )}
        {/* Tab 1: Single-Page Description Flow */}
        {activeTab === 'description' && (
          <div className="space-y-6 text-sm">
            {/* 1. Problem Statement */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-foreground tracking-tight">Problem Statement</h3>
              <div className="prose dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                {problem.description}
              </div>
            </div>

            {/* 2. Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Input Constraints
                </h4>
                <ul className="list-disc list-inside space-y-1 font-mono text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Examples */}
            {problem.examples && (
              <div className="space-y-3 pt-2 border-t border-border/40">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Examples
                </h4>
                {problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 text-slate-200 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-xs"
                  >
                    <p className="font-bold text-violet-400">Example {idx + 1}:</p>
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-emerald-400 font-semibold">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-amber-400 font-semibold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <p className="text-slate-400 font-sans italic text-[11px] pt-1">
                        Explanation: {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. Follow-up Challenge */}
            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs space-y-1">
              <span className="font-bold text-violet-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Follow-up Challenge:
              </span>
              <p className="text-foreground/90 font-sans">
                Can you implement an optimal $O(N)$ algorithm with $O(1)$ auxiliary space complexity?
              </p>
            </div>

            {/* 5. NEW SEPARATE SECTION: Sample Test Cases (10 Interactive Tabs) */}
            <SampleTestcasesBrowser testCases={problem.testCases || []} />

            {/* 6. Similar & Related Problems */}
            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                {prevSlug ? (
                  <Link href={`/dashboard/assessment/problems/${prevSlug}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="text-xs opacity-50">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                )}

                {nextSlug ? (
                  <Link href={`/dashboard/assessment/problems/${nextSlug}`}>
                    <Button size="sm" className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold">
                      Next Problem <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" disabled className="text-xs opacity-50">
                    Next Problem <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

              {/* Similar Problems Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                  <h5 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-violet-500" /> Same Topic ({problem.category})
                  </h5>
                  {sameTopic.length > 0 ? (
                    sameTopic.map((p, idx) => (
                      <Link key={idx} href={`/dashboard/assessment/problems/${p.slug}`}>
                        <div className="p-2 rounded bg-muted/60 hover:bg-muted flex items-center justify-between text-xs transition-all">
                          <span className="truncate max-w-[150px] font-medium">{p.title}</span>
                          <Badge variant="outline" className="text-[10px]">{p.difficulty}</Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No other topic problems.</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                  <h5 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                    <Flame className="h-3.5 w-3.5 text-amber-500" /> Same Difficulty
                  </h5>
                  {sameDifficulty.length > 0 ? (
                    sameDifficulty.map((p, idx) => (
                      <Link key={idx} href={`/dashboard/assessment/problems/${p.slug}`}>
                        <div className="p-2 rounded bg-muted/60 hover:bg-muted flex items-center justify-between text-xs transition-all">
                          <span className="truncate max-w-[150px] font-medium">{p.title}</span>
                          <Badge variant="outline" className="text-[10px]">{p.difficulty}</Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No similar difficulty problems.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hints */}
        {activeTab === 'hints' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Progressive Hint Unlock</h4>
            {problem.hints && problem.hints.length > 0 ? (
              problem.hints.map((h, idx) => {
                const isUnlocked = unlockedHints.has(idx);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/30 text-foreground'
                        : 'bg-muted/30 border-border/40 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-500">
                        <Lightbulb className="h-4 w-4" /> Hint {idx + 1}
                      </span>
                      {!isUnlocked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUnlockedHints(new Set([...unlockedHints, idx]))}
                          className="text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" /> Unlock Hint {idx + 1}
                        </Button>
                      )}
                    </div>

                    {isUnlocked ? (
                      <p className="mt-2 text-xs leading-relaxed font-sans">{h}</p>
                    ) : (
                      <p className="mt-2 text-xs italic font-sans opacity-60">
                        Click to reveal progressive algorithmic hint.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No hints available for this problem.</p>
            )}
          </div>
        )}

        {/* Tab 3: Editorial */}
        {activeTab === 'editorial' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Official Solution Editorial</h4>
              {!unlockedEditorial && (
                <Button
                  size="sm"
                  onClick={() => setUnlockedEditorial(true)}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  <Unlock className="h-3.5 w-3.5 mr-1" /> Open Full Solution
                </Button>
              )}
            </div>

            {unlockedEditorial ? (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs leading-relaxed space-y-4 font-mono">
                <div className="prose dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line font-sans">
                  {problem.editorial || '### Approach & Algorithm\n\nDetailed solution explanation breakdown.'}
                </div>

                {problem.complexityAnalysis && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <p className="font-bold text-violet-400 font-sans">Complexity Analysis:</p>
                    <p className="text-slate-300">{problem.complexityAnalysis}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-muted/20 border border-border/40 text-center space-y-3">
                <Lock className="h-8 w-8 mx-auto text-violet-500/60" />
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Official editorial contains Intuition, Approach, Algorithm breakdown, Complexity Analysis, and Reference Solutions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Solutions */}
        {activeTab === 'solutions' && (
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-sm">Community & Reference Solutions</h4>
            <p className="text-muted-foreground font-sans">
              Inspect multi-language optimal solutions (Python 3, Java 17, C++).
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 whitespace-pre-wrap">
              {problem.referenceSolution?.python || '# Reference Python Solution\nprint("Reference Solution")'}
            </div>
          </div>
        )}

        {/* Tab 5: Submissions */}
        {activeTab === 'submissions' && (
          <SubmissionsTable submissions={submissions} />
        )}

        {/* Tab 6: Discussion */}
        {activeTab === 'discussion' && (
          <div className="space-y-4 text-xs font-sans">
            <h4 className="font-semibold text-sm">Candidate Discussion Forum</h4>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-center text-muted-foreground py-10">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-violet-400" />
              Join the candidate discussion for {problem.title}. Share algorithmic approaches and Big-O optimizations.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
