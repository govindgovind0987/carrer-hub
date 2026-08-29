'use client';

import { useState, useEffect, useRef, use, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  getInterviewSessionAction,
  submitInterviewAnswerAction,
  updateInterviewStatusAction,
  generateFinalInterviewReportAction,
  uploadVoiceRecordingAction,
  submitCodingSubmissionAction,
} from '@/actions/interview';

export default function LiveInterviewRoomPage({ params }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  // Voice Interview Hook
  const voice = useVoiceInterview();

  // Session State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Load Session Data & Reconnect Support
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      // Check local cached session first for fast instant load / reconnect
      const cached = localStorage.getItem(`mock_session_${sessionId}`);
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
          localStorage.setItem(`mock_session_${sessionId}`, JSON.stringify(res.session));
        }
      } else if (!cached) {
        toast.error('Session not found or unavailable');
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

    const res = await generateFinalInterviewReportAction(sessionId, {
      session,
      questions,
      answers: Object.entries(answers).map(([qId, val]) => ({ questionId: qId, ...val })),
      feedbacks: Object.entries(feedbacks).map(([qId, val]) => ({ questionId: qId, ...val })),
    });

    if (res.success) {
      toast.success('Interview session completed successfully!', { id: 'end-interview' });
      router.push(`/dashboard/mock-interview/report/${sessionId}`);
    } else {
      toast.error(res.error || 'Error completing interview session', { id: 'end-interview' });
      setIsSubmitting(false);
    }
  }, [sessionId, session, questions, answers, feedbacks, router, voice]);

  // Update current answer state helper
  const handleAnswerUpdate = (field, value) => {
    const qId = currentQuestion?.id || `q_${currentIndex}`;
    setAnswers((prev) => {
      const existing = prev[qId] || {};
      const updated = { ...existing, [field]: value };

      // Auto-save to localStorage
      setAutoSaveStatus('Saving...');
      localStorage.setItem(`answer_${sessionId}_${qId}`, JSON.stringify(updated));
      setTimeout(() => setAutoSaveStatus('Saved'), 800);

      return { ...prev, [qId]: updated };
    });
  };

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

    setIsSubmitting(true);
    toast.loading('Evaluating answer with AI...', { id: 'eval-ans' });

    const qId = currentQuestion.id || `q_${currentIndex}`;
    const ansData = answers[qId] || {};

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
      toast.error('Failed to submit answer for evaluation', { id: 'eval-ans' });
    }

    setIsSubmitting(false);
  };

  // Main Interview Countdown Timer
  useEffect(() => {
    if (loading || isPaused || totalSecondsLeft <= 0 || !session) return;

    const timer = setInterval(() => {
      setTotalSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
      setQuestionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isPaused, totalSecondsLeft, session, handleEndInterview]);

  // Speak Question Aloud when navigating to a new question
  useEffect(() => {
    if (readQuestionAloud && currentQuestion?.question && !isPaused && !loading) {
      voice.speakText(currentQuestion.question);
    }
  }, [currentIndex, currentQuestion?.question, readQuestionAloud, isPaused, loading, voice]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
        <p className="text-sm font-medium text-muted-foreground">Preparing Live AI Interview Room...</p>
      </div>
    );
  }

  const currentFeedback = feedbacks[currentQuestion.id || `q_${currentIndex}`];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs uppercase border-violet-500/30 text-violet-600 bg-violet-500/10 font-bold">
            {session?.type || 'Live Mock Interview'}
          </Badge>
          <span className="text-sm font-semibold text-foreground">{session?.technology} ({session?.role})</span>
        </div>

        {/* Timer & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-violet-600" /> Total Remaining: {formatTime(totalSecondsLeft)}
          </Badge>

          <Button variant="outline" size="sm" onClick={() => setReadQuestionAloud(!readQuestionAloud)}>
            {readQuestionAloud ? <Volume2 className="h-4 w-4 text-violet-600" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
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
          <span className="text-violet-600">{autoSaveStatus}</span>
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
                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-1 text-xs">
                  <span className="font-semibold text-violet-600 flex items-center gap-1">
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

          {/* AI Immediate Feedback Box */}
          {currentFeedback && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> AI Answer Evaluation
                    </span>
                    <Badge variant="default" className="bg-emerald-600 text-white font-mono">
                      Score: {currentFeedback.score}/100
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{currentFeedback.feedback}</p>
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
                  <FileText className="h-4 w-4 text-violet-600" /> Candidate Response Input
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
                      className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        currentAnswerObj.selectedOption === opt
                          ? 'border-violet-600 bg-violet-500/10'
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSubmitCurrentAnswer}
                    disabled={isSubmitting}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-violet-600" /> Evaluate Answer
                  </Button>

                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 text-white">
                      Next Question <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleEndInterview} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Submit & End Interview
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
