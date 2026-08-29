'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Briefcase,
  Code2,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Sliders,
  Cpu,
  BrainCircuit,
  Wand2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createInterviewSessionAction } from '@/actions/interview';
import { SUPPORTED_TECHNOLOGIES } from '@/services/interview-ai';

const INTERVIEW_TYPES = [
  { id: 'Technical Interview', label: 'Technical Interview', desc: 'Focuses on deep technical knowledge, frameworks, and architecture.' },
  { id: 'Coding Interview', label: 'Coding Interview', desc: 'Live hands-on algorithmic and data structure problems with Monaco Editor.' },
  { id: 'System Design Interview', label: 'System Design Interview', desc: 'High-level architecture, scalability, trade-offs, and microservices.' },
  { id: 'Behavioral Interview', label: 'Behavioral Interview', desc: 'STAR method situational, leadership, and collaboration questions.' },
  { id: 'HR Interview', label: 'HR Interview', desc: 'Culture fit, career trajectory, expectations, and interpersonal skills.' },
  { id: 'Mixed Interview', label: 'Mixed Interview', desc: 'Comprehensive combination of Technical, Behavioral, and Coding questions.' },
  { id: 'Custom Interview', label: 'Custom Interview', desc: 'Tailor custom technical domains and question categories.' },
];

export default function CreateInterviewPage() {
  const router = useRouter();

  // Wizard Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState('Full Stack Software Engineer');
  const [technology, setTechnology] = useState('React');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [experience, setExperience] = useState('MID_LEVEL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState(['TECHNICAL']);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    toast.loading('Generating tailored AI Interview Session & questions...', { id: 'gen-interview' });

    try {
      const res = await createInterviewSessionAction({
        role,
        technology,
        experience,
        difficulty,
        type: interviewType,
        durationMinutes,
        numberOfQuestions,
        questionCategories: selectedCategories,
      });

      if (res.success) {
        toast.success('Interview session generated successfully!', { id: 'gen-interview' });
        // Store fallback session state in localStorage if DB is operating in dev fallback mode
        if (res.session) {
          localStorage.setItem(`mock_session_${res.sessionId}`, JSON.stringify(res.session));
        }
        router.push(`/dashboard/mock-interview/room/${res.sessionId}`);
      } else {
        toast.error(res.error || 'Failed to generate interview', { id: 'gen-interview' });
        setLoading(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred', { id: 'gen-interview' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create AI Mock Interview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure target role, technologies, and difficulty for an enterprise-grade realistic AI interview.
          </p>
        </div>

        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1 border-violet-500/30 text-violet-600 bg-violet-500/5">
          <Sparkles className="h-4 w-4" /> Groq Llama 3.3 Engine
        </Badge>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        {[
          { num: 1, label: 'Role & Type' },
          { num: 2, label: 'Technology Stack' },
          { num: 3, label: 'Parameters & Rules' },
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2 cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30 ring-2 ring-violet-500/20'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Role & Interview Type */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-violet-600" /> Target Position & Role
              </CardTitle>
              <CardDescription>Enter the position title you want to practice interviewing for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position Title</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Frontend Architect, Backend Developer"
                  className="h-11 bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-violet-600" /> Select Interview Type
              </CardTitle>
              <CardDescription>Choose the primary format and objective of this mock interview.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERVIEW_TYPES.map((t) => {
                  const selected = interviewType === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setInterviewType(t.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selected
                          ? 'border-violet-600 bg-violet-500/10 shadow-md ring-1 ring-violet-500'
                          : 'border-border/50 bg-muted/20 hover:border-violet-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{t.label}</h4>
                        {selected && <CheckCircle2 className="h-4 w-4 text-violet-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} className="bg-violet-600 hover:bg-violet-700 text-white">
              Next: Technology Stack <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Technology Stack & Categories */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Code2 className="h-5 w-5 text-violet-600" /> Select Primary Technology
              </CardTitle>
              <CardDescription>Choose from the 23 supported enterprise frameworks, languages, and core subjects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                {SUPPORTED_TECHNOLOGIES.map((tech) => {
                  const isSel = technology === tech;
                  return (
                    <Badge
                      key={tech}
                      onClick={() => setTechnology(tech)}
                      variant={isSel ? 'default' : 'outline'}
                      className={`cursor-pointer px-3.5 py-2 text-xs transition-all ${
                        isSel
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md'
                          : 'hover:border-violet-500 hover:bg-violet-500/5'
                      }`}
                    >
                      {tech}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-violet-600" /> Question Categories
              </CardTitle>
              <CardDescription>Select topic categories to include in this session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'TECHNICAL', label: 'Technical' },
                  { id: 'BEHAVIORAL', label: 'Behavioral' },
                  { id: 'HR', label: 'HR & Culture' },
                  { id: 'REACT', label: 'Frontend / UI' },
                  { id: 'NODEJS', label: 'Backend / API' },
                  { id: 'DSA', label: 'DSA & Algorithms' },
                  { id: 'SQL', label: 'Database & SQL' },
                ].map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-lg border text-center cursor-pointer text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-violet-600 bg-violet-600 text-white font-bold shadow-sm'
                          : 'border-border/60 bg-muted/20 hover:bg-accent'
                      }`}
                    >
                      {cat.label}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="bg-violet-600 hover:bg-violet-700 text-white">
              Next: Parameters & Rules <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Parameters, Difficulty & Duration */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-violet-600" /> Interview Parameters
              </CardTitle>
              <CardDescription>Configure difficulty, experience level, session timer, and question count.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRY_LEVEL">Entry Level (0-2 Yrs)</SelectItem>
                    <SelectItem value="MID_LEVEL">Mid Level (2-5 Yrs)</SelectItem>
                    <SelectItem value="SENIOR_LEVEL">Senior Level (5+ Yrs)</SelectItem>
                    <SelectItem value="LEAD">Staff / Tech Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy (Foundational)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Standard Enterprise)</SelectItem>
                    <SelectItem value="HARD">Hard (Advanced / FAANG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interview Duration (Minutes)</Label>
                <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes (Express)</SelectItem>
                    <SelectItem value="30">30 Minutes (Standard)</SelectItem>
                    <SelectItem value="45">45 Minutes (Deep Dive)</SelectItem>
                    <SelectItem value="60">60 Minutes (Full Loop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={String(numberOfQuestions)} onValueChange={(v) => setNumberOfQuestions(Number(v))}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions (Recommended)</SelectItem>
                    <SelectItem value="8">8 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Review Summary Box */}
          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardContent className="p-6 space-y-3">
              <h4 className="font-semibold text-sm text-violet-600 flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Ready to Generate AI Interview Session
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Role:</span>
                  <span className="font-semibold text-foreground">{role}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tech:</span>
                  <span className="font-semibold text-foreground">{technology}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Type:</span>
                  <span className="font-semibold text-foreground">{interviewType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Difficulty:</span>
                  <span className="font-semibold text-foreground">{difficulty} ({numberOfQuestions} Qs)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
              Back
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Session...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Start Interview Session
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
