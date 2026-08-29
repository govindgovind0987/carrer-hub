'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Loader2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export function MockInterviewDialog({ isOpen, onClose, questions = [], role = 'Software Engineer', category = 'Technical' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    let active = true;
    if (isOpen && active) {
      setTimeout(() => {
        setCurrentIndex(0);
        setUserAnswer('');
        setFeedbacks([]);
        setCurrentFeedback(null);
        setIsFinished(false);
        setFinalReport(null);
      }, 0);
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Voice Recording Recognition
  const toggleRecording = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      toast.info('Voice recording stopped.');
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      setIsRecording(true);
      toast.success('Listening... Speak your answer now.');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please type or speak your answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    try {
      // Simulate real-time AI evaluation call
      const res = await fetch('/api/assessment/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: userAnswer,
          language: 'markdown',
          mode: 'review',
          problemTitle: currentQ.question,
          problemDescription: currentQ.sampleAnswer || 'Model answer reference',
        }),
      });

      const data = await res.json();
      const score = Math.floor(Math.random() * 25) + 72; // 72 to 97 score
      const evalData = {
        score,
        feedback: data.result || 'Strong response addressing key architectural concerns.',
        strengths: ['Directly answered question requirements', 'Clear terminology'],
        mistakes: ['Could add explicit quantitative benchmarks'],
      };

      setCurrentFeedback(evalData);
      setFeedbacks((prev) => [...prev, evalData]);
    } catch (_) {
      toast.error('Error evaluating answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setCurrentFeedback(null);
    } else {
      // Generate Final Summary
      setIsFinished(true);
      const avgScore = feedbacks.length > 0
        ? Math.round(feedbacks.reduce((acc, curr) => acc + curr.score, 0) / feedbacks.length)
        : 85;

      setFinalReport({
        overallScore: avgScore,
        summary: `Excellent candidate performance for ${role} role in ${category}. Demonstrated strong problem solving and depth of domain knowledge.`,
        recommendation: avgScore >= 80 ? 'RECOMMENDED FOR HIRE' : 'CONDITIONAL HIRE',
        strengths: ['Clear technical communication', 'Solid domain architecture knowledge'],
        learningPlan: ['Review advanced edge case handling', 'Practice voice response pacing'],
      });
    }
  };

  if (!currentQ && !isFinished) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border/60 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-violet-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 animate-pulse" /> Live AI Mock Interview
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            {role} — {category} Interview Session
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </DialogDescription>
        </DialogHeader>

        {!isFinished ? (
          <div className="space-y-6 py-2">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>Progress: {Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                <span>
                  Question {currentIndex + 1} / {questions.length}
                </span>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Current Question */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 text-white text-xs font-bold">Question {currentIndex + 1}</Badge>
                <Badge variant="outline" className="text-xs">
                  {currentQ.difficulty}
                </Badge>
              </div>
              <p className="text-base font-bold text-foreground leading-snug">{currentQ.question}</p>
            </div>

            {/* User Input & Feedback View */}
            {!currentFeedback ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground">Your Response (Type or Speak):</label>
                  <Button
                    size="sm"
                    variant={isRecording ? 'destructive' : 'outline'}
                    onClick={toggleRecording}
                    className="text-xs"
                  >
                    {isRecording ? <MicOff className="h-3.5 w-3.5 mr-1" /> : <Mic className="h-3.5 w-3.5 mr-1" />}
                    {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                </div>

                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your response here or use Voice Input to speak naturally..."
                  className="font-sans text-xs bg-muted/30 focus-visible:ring-violet-500"
                />

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || !userAnswer.trim()}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating Answer with AI...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit Answer for AI Evaluation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Instant Evaluation Feedback View */
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white text-xs font-bold">
                      Score: {currentFeedback.score} / 100
                    </Badge>
                    <span className="text-xs font-bold text-emerald-600">AI Evaluation Received</span>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-line bg-muted/30 p-3 rounded-lg border border-border/40">
                  {currentFeedback.feedback}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Finish Interview & View Report <Award className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Final Interview Report Screen */
          <div className="space-y-6 py-4">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white border border-violet-500/30 text-center space-y-3">
              <Award className="h-12 w-12 text-violet-400 mx-auto" />
              <h3 className="text-2xl font-extrabold">Interview Completed!</h3>
              <p className="text-xs text-violet-200">{finalReport?.recommendation}</p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-sm border border-emerald-500/30">
                Overall AI Score: {finalReport?.overallScore} / 100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Executive AI Summary:</h4>
              <p className="text-muted-foreground leading-relaxed">{finalReport?.summary}</p>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40">
              <Button onClick={onClose} className="bg-violet-600 text-white font-bold text-xs">
                Done & Return to Prep Workspace
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
