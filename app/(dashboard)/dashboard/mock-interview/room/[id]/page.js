'use client';

import { useState, useEffect, useRef, use, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Pause,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Square,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  Code2,
  Mic,
  FileText,
  RotateCcw,
  Loader2,
  AlertCircle,
  HelpCircle,
  Target,
  Lightbulb,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { useVoiceInterview } from '@/hooks/useVoiceInterview';
import { VoiceRecorder } from '@/components/interview/voice-recorder';
import { CodeEditorComponent } from '@/components/interview/code-editor';
import { useSetAssistantContext } from '@/components/assistant';
import {
  getInterviewSessionAction,
  submitInterviewAnswerAction,
  updateInterviewStatusAction,
  generateFinalInterviewReportAction,
  uploadVoiceRecordingAction,
  submitCodingSubmissionAction,
} from '@/actions/interview';

export default function LiveInterviewRoomPage({ params: propsParams }) {
  const router = useRouter();
  const routerParams = useParams();
  const resolvedParams = propsParams && typeof propsParams.then === 'function' ? use(propsParams) : propsParams;
  const sessionId = routerParams?.id || routerParams?.sessionId || resolvedParams?.id || resolvedParams?.sessionId;

  // Voice Interview Hook
  const voice = useVoiceInterview();

  // Session State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  const [readQuestionAloud, setReadQuestionAloud] = useState(true);

  // Answers State: map of questionId => { answerType, textAnswer, codeSnippet, selectedOption, voiceUrl }
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  // Timers
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(1800); // 30 mins default
  const [questionSeconds, setQuestionSeconds] = useState(0);

  // Sync active interview question and candidate answer to AI Assistant
  const currentQ = session?.questions?.[currentIndex];
  useSetAssistantContext({
    pageType: 'interview-room',
    sessionId,
    role: session?.role,
    technology: session?.technology,
    currentQuestionIndex: currentIndex + 1,
    currentQuestionText: currentQ?.question,
    currentQuestionType: currentQ?.questionType,
    userAnswerText: (currentQ?.id && answers[currentQ.id]?.textAnswer) || voice?.transcript || '',
  });

  // Load Session Data & Reconnect Support
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!sessionId) {
        if (isMounted) {
          setError('Missing session ID parameter.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      // Check local cached session first for fast instant load / reconnect
      const cached = typeof window !== 'undefined' ? localStorage.getItem(`mock_session_${sessionId}`) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setSession(parsed);
            setTotalSecondsLeft((parsed.durationMinutes || 30) * 60);
          }
        } catch (e) {
          // ignore
        }
      }

      // Fetch official server session
      const res = await getInterviewSessionAction(sessionId);
      if (res.success && res.session) {
        if (isMounted) {
          setSession(res.session);
          setTotalSecondsLeft((res.session.durationMinutes || 30) * 60);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`mock_session_${sessionId}`, JSON.stringify(res.session));
          }

          // Restore previously persisted answers from database
          if (Array.isArray(res.session.answers) && res.session.answers.length > 0) {
            const answerMap = {};
            res.session.answers.forEach((ans) => {
              answerMap[ans.questionId] = {
                answerType: ans.answerType,
                textAnswer: ans.userAnswer,
                codeSnippet: ans.codeSnippet,
                selectedOption: ans.selectedOption,
              };
            });
            setAnswers((prev) => ({ ...answerMap, ...prev }));
          }

          // Restore previously persisted feedbacks from database
          if (Array.isArray(res.session.feedbacks) && res.session.feedbacks.length > 0) {
            const feedbackMap = {};
            res.session.feedbacks.forEach((fb) => {
              feedbackMap[fb.questionId] = fb;
            });
            setFeedbacks((prev) => ({ ...feedbackMap, ...prev }));
          }

          if (typeof res.session.currentQuestionIndex === 'number' && res.session.currentQuestionIndex > 0) {
            setCurrentIndex(res.session.currentQuestionIndex);
          }
        }
      } else if (!cached) {
        if (isMounted) {
          setError(res.error || 'Interview session not found or unauthorized.');
          toast.error(res.error || 'Session not found or unavailable');
        }
      }

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const questions = useMemo(() => session?.questions || [], [session?.questions]);
  const currentQuestion = questions[currentIndex] || {};

  const handleEndInterview = useCallback(async () => {
    setIsSubmitting(true);
    toast.loading('Synthesizing comprehensive AI Interview Report...', { id: 'end-interview' });

    voice.stopSpeaking();
    voice.resetVoiceState();

    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      answerType: val?.answerType || 'TEXT',
      userAnswer: (val?.textAnswer || val?.selectedOption || val?.codeSnippet || '').trim(),
      codeSnippet: val?.codeSnippet || null,
      selectedOption: val?.selectedOption || null,
      timeTakenSec: questionSeconds,
    }));

    const res = await generateFinalInterviewReportAction(sessionId, {
      answers: formattedAnswers,
    });

    if (res.success && res.report) {
      toast.success('Interview session completed successfully!', { id: 'end-interview' });
      router.push(`/dashboard/mock-interview/report/${sessionId}`);
    } else {
      toast.error(res.error || 'Error completing interview session', { id: 'end-interview' });
      setIsSubmitting(false);
    }
  }, [sessionId, answers, questionSeconds, router, voice]);

  // Update current answer state helper
  const handleAnswerUpdate = useCallback((field, value) => {
    const qId = currentQuestion?.id || `q_${currentIndex}`;
    setAnswers((prev) => {
      const existing = prev[qId] || {};
      const updated = { ...existing, [field]: value };

      // Auto-save to localStorage
      setAutoSaveStatus('Saving...');
      if (typeof window !== 'undefined') {
        localStorage.setItem(`answer_${sessionId}_${qId}`, JSON.stringify(updated));
      }
      setTimeout(() => setAutoSaveStatus('Saved'), 800);

      return { ...prev, [qId]: updated };
    });
  }, [currentQuestion?.id, currentIndex, sessionId]);

  const currentAnswerObj = answers[currentQuestion?.id || `q_${currentIndex}`] || {};

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionSeconds(0);
      updateInterviewStatusAction(sessionId, 'IN_PROGRESS', currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setQuestionSeconds(0);
    }
  };

  const handleTogglePause = () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    if (newPauseState) {
      voice.stopSpeaking();
      updateInterviewStatusAction(sessionId, 'PAUSED', currentIndex);
      toast.info('Interview session paused. Timers frozen.');
    } else {
      updateInterviewStatusAction(sessionId, 'IN_PROGRESS', currentIndex);
      toast.success('Interview session resumed.');
    }
  };

  const handleSubmitCurrentAnswer = async () => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id || `q_${currentIndex}`;
    const ansData = answers[qId] || {};
    const cleanAnswerText = (ansData.textAnswer || voice.transcript || ansData.selectedOption || ansData.codeSnippet || '').trim();

    if (!cleanAnswerText) {
      toast.error('Please provide an answer before submitting.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    toast.loading('Analyzing your answer...', { id: 'eval-ans' });
    voice.stopSpeaking();

    // Upload voice recording if present
    if (voice.audioUrl || ansData.textAnswer) {
      await uploadVoiceRecordingAction({
        sessionId,
        questionId: qId,
        audioUrl: voice.audioUrl || '',
        durationSec: voice.recordingDuration || 0,
        transcription: ansData.textAnswer || voice.transcript || '',
        confidence: voice.confidence || 0.85,
      });
    }

    // Submit code solution if code question
    if (ansData.codeSnippet) {
      await submitCodingSubmissionAction({
        sessionId,
        questionId: qId,
        code: ansData.codeSnippet,
        language: session?.technology?.toLowerCase() || 'javascript',
      });
    }

    const res = await submitInterviewAnswerAction({
      sessionId,
      questionId: qId,
      answerType: currentQuestion.questionType || 'TEXT',
      userAnswer: ansData.textAnswer || voice.transcript || ansData.selectedOption || '',
      codeSnippet: ansData.codeSnippet || '',
      selectedOption: ansData.selectedOption || '',
      confidenceScore: voice.confidence || 0.85,
      timeTakenSec: questionSeconds,
    });

    if (res.success && res.evaluation) {
      setFeedbacks((prev) => ({ ...prev, [qId]: res.evaluation }));
      toast.success(`AI Evaluation Complete! Score: ${res.evaluation.score}/100`, { id: 'eval-ans' });
    } else {
      toast.error(res.error || 'Failed to submit answer for evaluation', { id: 'eval-ans' });
    }

    setIsSubmitting(false);
  };

  const handleEndInterviewRef = useRef(handleEndInterview);
  useEffect(() => {
    handleEndInterviewRef.current = handleEndInterview;
  }, [handleEndInterview]);

  // Main Interview Countdown Timer
  useEffect(() => {
    if (loading || isPaused || !session) return;

    const timer = setInterval(() => {
      setTotalSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndInterviewRef.current?.();
          return 0;
        }
        return prev - 1;
      });
      setQuestionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isPaused, session]);

  const { speakText } = voice;

  // Speak Question Aloud when navigating to a new question
  useEffect(() => {
    if (readQuestionAloud && currentQuestion?.question && !isPaused && !loading) {
      speakText(currentQuestion.question);
    }
  }, [currentIndex, currentQuestion?.question, readQuestionAloud, isPaused, loading, speakText]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Preparing Live AI Interview Room...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-4 p-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Interview Session Unavailable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {error || 'This interview session could not be found or you do not have permission to access it.'}
        </p>
        <div className="flex items-center gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/mock-interview')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> All Interviews
          </Button>
          <Button onClick={() => router.push('/dashboard/mock-interview/create')} className="bg-primary text-primary-foreground">
            <Sparkles className="mr-2 h-4 w-4" /> Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  const currentFeedback = feedbacks[currentQuestion.id || `q_${currentIndex}`];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs uppercase border-primary/30 text-primary bg-primary/10 font-bold">
            {session?.type || 'Live Mock Interview'}
          </Badge>
          <span className="text-sm font-semibold text-foreground">{session?.technology} ({session?.role})</span>
        </div>

        {/* Timer & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Total Remaining: {formatTime(totalSecondsLeft)}
          </Badge>

          <Button variant="outline" size="sm" onClick={() => setReadQuestionAloud(!readQuestionAloud)}>
            {readQuestionAloud ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>

          <Button variant="outline" size="sm" onClick={handleTogglePause}>
            {isPaused ? <Play className="h-4 w-4 mr-1 text-emerald-500" /> : <Pause className="h-4 w-4 mr-1 text-amber-500" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={isSubmitting}>
            <Square className="h-3.5 w-3.5 mr-1" /> End Interview
          </Button>
        </div>
      </div>

      {/* Progress & Counter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-primary">{autoSaveStatus}</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Main Interview Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Guidance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {currentQuestion.category || 'TECHNICAL'}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {currentQuestion.difficulty || 'MEDIUM'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold pt-2 leading-relaxed text-foreground">
                {currentQuestion.question || 'Loading Question...'}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Question Hints */}
              {currentQuestion.hints?.length > 0 && (
                <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-1 text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> AI Hint
                  </span>
                  <p className="text-muted-foreground">{currentQuestion.hints[0]}</p>
                </div>
              )}

              {/* Talking points check list */}
              {currentQuestion.keyPoints?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Talking Points</h4>
                  <div className="space-y-1.5">
                    {currentQuestion.keyPoints.map((kp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyzing Loading Indicator */}
          {isSubmitting && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Analyzing your answer...</p>
                    <p className="text-[11px] text-muted-foreground">Evaluating semantic correctness and technical depth with Groq AI...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Immediate Structured Feedback Box (Requirement 7) */}
          {currentFeedback && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card
                className={`overflow-hidden border ${
                  currentFeedback.verdict === 'CORRECT'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : currentFeedback.verdict === 'PARTIALLY_CORRECT'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : currentFeedback.verdict === 'NOT_ANSWERED'
                    ? 'border-border/60 bg-muted/20'
                    : 'border-rose-500/40 bg-rose-500/5'
                }`}
              >
                {/* Header with Verdict and Score */}
                <CardHeader className="p-4 pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Answer:
                      </span>
                      <Badge
                        className={`text-xs font-bold px-2.5 py-0.5 ${
                          currentFeedback.verdict === 'CORRECT'
                            ? 'bg-emerald-600 text-white'
                            : currentFeedback.verdict === 'PARTIALLY_CORRECT'
                            ? 'bg-amber-600 text-white'
                            : currentFeedback.verdict === 'NOT_ANSWERED'
                            ? 'bg-muted text-muted-foreground border border-border'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {currentFeedback.verdict === 'CORRECT'
                          ? 'Correct'
                          : currentFeedback.verdict === 'PARTIALLY_CORRECT'
                          ? 'Partially Correct'
                          : currentFeedback.verdict === 'NOT_ANSWERED'
                          ? 'Not Answered'
                          : 'Incorrect'}
                      </Badge>
                    </div>

                    <Badge variant="outline" className="font-mono text-xs font-bold px-2.5 py-0.5 border-foreground/20">
                      Score: {currentFeedback.score}/100
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* What you did well */}
                  {Array.isArray(currentFeedback.strengths) && currentFeedback.strengths.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> What you did well:
                      </h5>
                      <ul className="space-y-1 pl-4">
                        {currentFeedback.strengths.map((str, sIdx) => (
                          <li key={sIdx} className="text-xs text-foreground/80 list-disc">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What you missed */}
                  {Array.isArray(currentFeedback.missingConcepts) && currentFeedback.missingConcepts.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" /> What you missed:
                      </h5>
                      <ul className="space-y-1 pl-4">
                        {currentFeedback.missingConcepts.map((mc, mIdx) => (
                          <li key={mIdx} className="text-xs text-foreground/80 list-disc">
                            {mc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technical correction */}
                  {Array.isArray(currentFeedback.mistakes) && currentFeedback.mistakes.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Technical correction:
                      </h5>
                      <ul className="space-y-1 pl-4">
                        {currentFeedback.mistakes.map((mis, misIdx) => (
                          <li key={misIdx} className="text-xs text-foreground/80 list-disc">
                            {mis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Better answer */}
                  {currentFeedback.idealAnswer && (
                    <div className="space-y-1.5 pt-1">
                      <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5" /> Better answer:
                      </h5>
                      <p className="text-xs leading-relaxed text-foreground/90 bg-card p-3 rounded-md border border-border/50">
                        {currentFeedback.idealAnswer}
                      </p>
                    </div>
                  )}

                  {/* Overall Coaching Feedback */}
                  {currentFeedback.feedback && (
                    <div className="space-y-1 pt-1 border-t border-border/30">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        Detailed Feedback:
                      </span>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {currentFeedback.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: Answer Input Area (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Candidate Response Input
                </CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  Type: {currentQuestion.questionType || 'TEXT'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Type 1: CODE Question -> Monaco Editor */}
              {currentQuestion.questionType === 'CODE' && (
                <div className="space-y-3">
                  <CodeEditorComponent
                    initialCode={currentAnswerObj.codeSnippet || currentQuestion.codeTemplate || '// Write your code solution here...'}
                    language={session?.technology?.toLowerCase() || 'javascript'}
                    onChange={(val) => handleAnswerUpdate('codeSnippet', val)}
                  />
                  <Textarea
                    placeholder="Add optional notes or verbal explanation of your code design..."
                    value={currentAnswerObj.textAnswer || ''}
                    onChange={(e) => handleAnswerUpdate('textAnswer', e.target.value)}
                    className="min-h-20 bg-background text-xs"
                  />
                </div>
              )}

              {/* Type 2: VOICE Question -> Voice Recorder */}
              {currentQuestion.questionType === 'VOICE' && (
                <VoiceRecorder
                  voice={voice}
                  onAnswerChange={(transcriptStr) => handleAnswerUpdate('textAnswer', transcriptStr)}
                />
              )}

              {/* Type 3: MULTIPLE_CHOICE Question */}
              {currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                <RadioGroup
                  value={currentAnswerObj.selectedOption || ''}
                  onValueChange={(val) => handleAnswerUpdate('selectedOption', val)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`flex items-center space-x-3 p-4 rounded-md border cursor-pointer transition-all ${
                        currentAnswerObj.selectedOption === opt
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value={opt} id={`opt_${oIdx}`} />
                      <Label htmlFor={`opt_${oIdx}`} className="text-sm font-medium cursor-pointer leading-normal flex-1">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Type 4: Default TEXT / PARAGRAPH Response */}
              {(currentQuestion.questionType === 'TEXT' || currentQuestion.questionType === 'PARAGRAPH') && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your structured answer here in detail..."
                    value={currentAnswerObj.textAnswer || ''}
                    onChange={(e) => handleAnswerUpdate('textAnswer', e.target.value)}
                    className="min-h-48 text-sm leading-relaxed p-4 bg-background border-border/60"
                  />
                  {/* Voice recording shortcut option */}
                  <VoiceRecorder
                    voice={voice}
                    onAnswerChange={(transcriptStr) => handleAnswerUpdate('textAnswer', transcriptStr)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-4 border-t border-border/40 w-full min-w-0">
                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentIndex === 0} className="w-full sm:w-auto order-3 sm:order-1">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSubmitCurrentAnswer}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Evaluate Answer
                  </Button>

                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} className="bg-primary hover:bg-primary text-primary-foreground flex-1 sm:flex-initial">
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleEndInterview} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-initial">
                      Submit & End
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
