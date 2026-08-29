'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Filter,
  Bookmark,
  Layers,
  History,
  Play,
  Sliders,
  Award,
  HelpCircle,
  Briefcase,
  Building2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QuestionCard } from '@/components/interview-prep/question-card';
import { MockInterviewDialog } from '@/components/interview-prep/mock-interview-dialog';
import { HistoryDrawer } from '@/components/interview-prep/history-drawer';

import {
  generateCustomInterviewAction,
  generateSimilarQuestionsAction,
  explainAnswerAction,
  simplifyAnswerAction,
  modifyQuestionDifficultyAction,
  toggleBookmarkQuestionAction,
  getUserInterviewHistoryAction,
} from '@/actions/ai';

const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'SDE-1',
  'SDE-2',
  'Senior Software Engineer',
  'Java Developer',
  'Python Developer',
  'C++ Developer',
  'Node.js Developer',
  'React Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Cyber Security Engineer',
  'Mobile App Developer',
  'QA Engineer',
  'Database Engineer',
  'System Engineer',
  'Custom',
];

const CATEGORIES = [
  'Technical',
  'Behavioral',
  'HR',
  'System Design',
  'DSA',
  'Operating Systems',
  'Computer Networks',
  'DBMS',
  'OOP',
  'SQL',
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'React',
  'Node.js',
  'Next.js',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'Prisma',
  'Docker',
  'Git',
  'Linux',
  'Cloud',
  'DevOps',
  'AI',
  'Machine Learning',
  'Custom Category',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];
const EXPERIENCES = ['Fresher', '0-1 Years', '2 Years', '3 Years', '5 Years', '7 Years', '10+ Years'];
const QUESTION_COUNTS = [5, 10, 20, 30, 50, 100];
const COMPANY_STYLES = [
  'General Interview',
  'Startup',
  'Product Company',
  'Service Company',
  'Enterprise',
  'FAANG-style',
];

export default function InterviewPrepPage() {
  // Configurator Form State
  const [role, setRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [category, setCategory] = useState('Technical');
  const [customCategory, setCustomCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experience, setExperience] = useState('3 Years');
  const [numQuestions, setNumQuestions] = useState(10);
  const [companyStyle, setCompanyStyle] = useState('Product Company');

  // Application State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Modals & Drawers state
  const [isMockDialogOpen, setIsMockDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Generate Custom Interview Submission
  const handleGenerateInterview = async (overrideConfig = null) => {
    setIsGenerating(true);
    setApiError(null);

    const finalRole = overrideConfig?.role || (role === 'Custom' ? customRole.trim() || 'Software Engineer' : role);
    const finalCategory = overrideConfig?.category || (category === 'Custom Category' ? customCategory.trim() || 'Technical' : category);
    const finalDiff = overrideConfig?.difficulty || difficulty;
    const finalExp = overrideConfig?.experience || experience;
    const finalNumQ = overrideConfig?.numberOfQuestions || numQuestions;
    const finalCompany = overrideConfig?.companyStyle || companyStyle;

    try {
      const res = await generateCustomInterviewAction({
        role: finalRole,
        category: finalCategory,
        difficulty: finalDiff,
        experience: finalExp,
        numberOfQuestions: finalNumQ,
        companyStyle: finalCompany,
        refresh: true,
      });

      if (res.success) {
        setQuestions(res.questions || []);
        setActiveSession(res.session);
        toast.success(`🎉 Generated ${res.questions.length} fresh questions for ${finalRole}!`);
      } else {
        setApiError(res.error || 'Groq AI generation encountered an error.');
        toast.error(res.error || 'Generation failed');
      }
    } catch (err) {
      setApiError('API connection failed: ' + err.message);
      toast.error('Error generating questions: ' + err.message);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await handleGenerateInterview();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch History Sessions
  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    try {
      const res = await getUserInterviewHistoryAction();
      if (res.success) {
        setPastSessions(res.sessions || []);
      }
    } catch (_) {}
  };

  // Reopen Past Session from History
  const handleSelectHistorySession = (session) => {
    if (session.questions && session.questions.length > 0) {
      setQuestions(session.questions);
      setActiveSession(session);
      setRole(session.role || 'Software Engineer');
      setCategory(session.technology || 'Technical');
      setDifficulty(session.difficulty || 'Medium');
      setExperience(session.experience || '3 Years');
      setNumQuestions(session.numberOfQuestions || 10);
      setCompanyStyle(session.companyStyle || 'General Interview');
      toast.success(`Reopened session: ${session.role} (${session.technology})`);
    }
  };

  // AI Question Transformations
  const handleGenerateSimilar = async (questionText, qCategory, qDifficulty, qRole) => {
    const res = await generateSimilarQuestionsAction({
      questionText,
      category: qCategory,
      difficulty: qDifficulty,
      role: qRole,
    });
    return res.questions || [];
  };

  const handleExplain = async (questionText, answerText) => {
    const res = await explainAnswerAction({ questionText, answerText });
    return res.explanation || 'Explanation generated.';
  };

  const handleSimplify = async (questionText, answerText) => {
    const res = await simplifyAnswerAction({ questionText, answerText });
    return res.simplified || 'Simplified version generated.';
  };

  const handleMakeHarder = async (questionId) => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ) return;
    toast.info('Regenerating question at Harder difficulty level...');
    const res = await modifyQuestionDifficultyAction({
      questionText: targetQ.question,
      currentDifficulty: targetQ.difficulty,
      targetDifficulty: 'Hard',
      role: targetQ.role || role,
    });

    if (res.success && res.question) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...res.question } : q))
      );
      toast.success('Question updated to Hard difficulty!');
    }
  };

  const handleMakeEasier = async (questionId) => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ) return;
    toast.info('Regenerating question at Easy difficulty level...');
    const res = await modifyQuestionDifficultyAction({
      questionText: targetQ.question,
      currentDifficulty: targetQ.difficulty,
      targetDifficulty: 'Easy',
      role: targetQ.role || role,
    });

    if (res.success && res.question) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...res.question } : q))
      );
      toast.success('Question updated to Easy difficulty!');
    }
  };

  const handleToggleBookmark = async (questionId, bookmarked) => {
    await toggleBookmarkQuestionAction(questionId, bookmarked);
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, bookmarked } : q))
    );
  };

  // Filter questions by bookmark state if toggled
  const displayedQuestions = bookmarkedOnly ? questions.filter((q) => q.bookmarked) : questions;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              AI Interview Preparation Platform
            </h1>
            <Badge variant="secondary" className="text-[10px]">Groq Engine</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Configure job role, topic category, difficulty, experience level, and company style to generate unique interview question sets with model answers.
          </p>
        </div>

        {/* Quick Vault & Mock Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setIsMockDialogOpen(true)}
            disabled={questions.length === 0}
            size="sm"
          >
            <Play className="mr-1.5 h-3.5 w-3.5" /> Start AI Mock Interview
          </Button>

          <Button
            onClick={handleOpenHistory}
            variant="outline"
            size="sm"
          >
            <History className="mr-1.5 h-3.5 w-3.5" /> Session Vault
          </Button>
        </div>
      </div>

      {/* Main Interactive AI Interview Configurator Panel */}
      <Card>
        <div className="bg-muted/30 border-b border-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
            <Sliders className="h-3.5 w-3.5" /> Generate Custom Interview Configurator
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Powered by Groq LLM API
          </span>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Job Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Briefcase className="h-3.5 w-3.5 text-violet-500" /> Job Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {role === 'Custom' && (
                <Input
                  placeholder="Enter custom role..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="text-xs mt-1.5 bg-muted/40"
                />
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> Category / Topic
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {category === 'Custom Category' && (
                <Input
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="text-xs mt-1.5 bg-muted/40"
                />
              )}
            </div>

            {/* Difficulty Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Filter className="h-3.5 w-3.5 text-amber-500" /> Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Award className="h-3.5 w-3.5 text-emerald-500" /> Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {EXPERIENCES.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <HelpCircle className="h-3.5 w-3.5 text-rose-500" /> Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {QUESTION_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt} Questions
                  </option>
                ))}
              </select>
            </div>

            {/* Company Style Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Building2 className="h-3.5 w-3.5 text-cyan-500" /> Company Style
              </label>
              <select
                value={companyStyle}
                onChange={(e) => setCompanyStyle(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                {COMPANY_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Button
                variant={bookmarkedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                className="text-xs"
              >
                <Bookmark className={`h-3.5 w-3.5 mr-1 ${bookmarkedOnly ? 'fill-current' : ''}`} /> Bookmarked Questions
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleGenerateInterview()}
                disabled={isGenerating || loading}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Fresh Interview with Groq AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Custom Interview
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Resiliency Banner */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
          <Button
            size="sm"
            onClick={() => handleGenerateInterview()}
            variant="outline"
            className="border-rose-500/40 text-rose-600 hover:bg-rose-500/20 text-xs shrink-0"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry Generation
          </Button>
        </div>
      )}

      {/* Active Session Badge Summary */}
      {activeSession && !apiError && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-600 text-white text-xs font-bold">{activeSession.role}</Badge>
            <Badge variant="outline" className="text-xs">
              {activeSession.technology || activeSession.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {activeSession.difficulty}
            </Badge>
            {activeSession.companyStyle && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {activeSession.companyStyle}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {questions.length} Generated Questions Stored in Session Vault
            </span>
          </div>

          <Button
            onClick={() => handleGenerateInterview()}
            disabled={loading || isGenerating}
            variant="ghost"
            size="sm"
            className="text-xs text-violet-600 hover:bg-violet-500/10"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} /> Refresh Questions
          </Button>
        </div>
      )}

      {/* Generated Questions List */}
      {loading || isGenerating ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-violet-600">
          <Loader2 className="h-10 w-10 animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground">
            Synthesizing Fresh Interview Questions with Groq LLM (Llama 3.3 70B)...
          </span>
        </div>
      ) : displayedQuestions.length === 0 ? (
        <Card className="border-dashed bg-card/40 backdrop-blur-xl">
          <CardContent className="py-16 text-center text-muted-foreground space-y-3">
            <HelpCircle className="mx-auto h-12 w-12 text-violet-500" />
            <h3 className="text-lg font-bold text-foreground">No questions found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Select your parameters in the Configurator above and click &quot;Generate Custom Interview&quot; to synthesize a fresh AI interview set.
            </p>
            <Button
              onClick={() => handleGenerateInterview()}
              size="sm"
              className="bg-violet-600 text-white font-bold text-xs"
            >
              Generate Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {displayedQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id || idx}
              question={q}
              index={idx}
              totalCount={displayedQuestions.length}
              onRefresh={handleGenerateInterview}
              onGenerateSimilar={handleGenerateSimilar}
              onExplain={handleExplain}
              onSimplify={handleSimplify}
              onMakeHarder={handleMakeHarder}
              onMakeEasier={handleMakeEasier}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Modals and Drawers */}
      <MockInterviewDialog
        isOpen={isMockDialogOpen}
        onClose={() => setIsMockDialogOpen(false)}
        questions={questions}
        role={activeSession?.role || role}
        category={activeSession?.technology || category}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={pastSessions}
        onSelectSession={handleSelectHistorySession}
      />
    </div>
  );
}
