'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [customQuestionTitle, setCustomQuestionTitle] = useState('');
  const [customQuestionDesc, setCustomQuestionDesc] = useState('');
  const [customQuestions, setCustomQuestions] = useState([]);

  useEffect(() => {
    fetch('/api/assessment/problems')
      .then((res) => res.json())
      .then((data) => {
        if (data.problems) setAvailableProblems(data.problems);
      })
      .catch(() => {});
  }, []);

  const handleToggleProblem = (id) => {
    if (selectedProblemIds.includes(id)) {
      setSelectedProblemIds(selectedProblemIds.filter((pId) => pId !== id));
    } else {
      setSelectedProblemIds([...selectedProblemIds, id]);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestionTitle.trim()) {
      toast.error('Question title is required');
      return;
    }
    setCustomQuestions([
      ...customQuestions,
      { title: customQuestionTitle, description: customQuestionDesc },
    ]);
    setCustomQuestionTitle('');
    setCustomQuestionDesc('');
    toast.success('Custom question added!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter an assessment title');
      return;
    }
    if (selectedProblemIds.length === 0 && customQuestions.length === 0) {
      toast.error('Please select at least one problem or add a custom question');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/assessment/recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          timeLimitMinutes,
          passingScore,
          problemIds: selectedProblemIds,
          customQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assessment');

      toast.success('Coding Assessment created successfully!');
      router.push('/dashboard/recruiter/assessments');
    } catch (err) {
      toast.error(err.message || 'Error creating assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Coding Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Design a custom technical evaluation for candidate hiring pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">1. General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Assessment Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer Technical Test"
                required
                className="bg-muted/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description / Instructions</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide details or candidate instructions..."
                className="bg-muted/40 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-muted/40 border border-border/60 text-xs font-semibold rounded-lg p-2.5"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Time Limit (Minutes)</label>
                <Input
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(e.target.value)}
                  min={15}
                  max={240}
                  className="bg-muted/40 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Passing Score (%)</label>
                <Input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  min={1}
                  max={100}
                  className="bg-muted/40 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problem Selection */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">2. Select Problem Bank Questions</CardTitle>
            <CardDescription className="text-xs">
              Choose from our verified DSA & Programming challenge library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y divide-border/40 max-h-72 overflow-y-auto pr-2">
              {availableProblems.map((prob) => {
                const isSelected = selectedProblemIds.includes(prob.id);
                return (
                  <div
                    key={prob.id}
                    onClick={() => handleToggleProblem(prob.id)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-500/10 border border-violet-500/30'
                        : 'hover:bg-muted/40 border border-transparent'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs">{prob.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{prob.difficulty}</Badge>
                        <span>{prob.category}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-violet-600" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Questions */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">3. Add Custom Coding Question (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/40">
              <Input
                value={customQuestionTitle}
                onChange={(e) => setCustomQuestionTitle(e.target.value)}
                placeholder="Question Title (e.g. Write a custom REST handler)"
                className="bg-card text-xs"
              />
              <Textarea
                value={customQuestionDesc}
                onChange={(e) => setCustomQuestionDesc(e.target.value)}
                rows={2}
                placeholder="Question description and input format..."
                className="bg-card text-xs"
              />
              <Button
                type="button"
                onClick={handleAddCustomQuestion}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Question to Assessment
              </Button>
            </div>

            {customQuestions.length > 0 && (
              <div className="space-y-2">
                {customQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-muted/40 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold">{q.title}</p>
                      <p className="text-muted-foreground text-[10px]">{q.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== idx))}
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-6 text-sm shadow-xl"
        >
          {loading ? 'Creating Assessment...' : 'Publish Assessment & Generate Invite Link'}
        </Button>
      </form>
    </div>
  );
}
