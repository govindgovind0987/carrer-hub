'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sparkles, Sliders, Building2, Briefcase, Award, Layers, HelpCircle, Loader2 } from 'lucide-react';

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

export function GenerateInterviewModal({ isOpen, onClose, onGenerate, isGenerating }) {
  const [role, setRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [category, setCategory] = useState('Technical');
  const [customCategory, setCustomCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experience, setExperience] = useState('3 Years');
  const [numQuestions, setNumQuestions] = useState(10);
  const [companyStyle, setCompanyStyle] = useState('Product Company');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRole = role === 'Custom' ? customRole.trim() || 'Software Engineer' : role;
    const finalCategory = category === 'Custom Category' ? customCategory.trim() || 'Technical' : category;

    onGenerate({
      role: finalRole,
      category: finalCategory,
      difficulty,
      experience,
      numberOfQuestions: numQuestions,
      companyStyle,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/60 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-violet-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 animate-pulse" /> AI Interview Configurator
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Generate Custom AI Interview Session
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure target job role, category, difficulty, experience level, and company interview style for Groq LLM generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Job Role Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
              <Briefcase className="h-3.5 w-3.5 text-violet-500" /> Target Job Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {JOB_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {role === 'Custom' && (
              <Input
                placeholder="Enter custom job role (e.g. Quantum Computing Engineer)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="text-xs mt-2 bg-muted/40"
              />
            )}
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
              <Layers className="h-3.5 w-3.5 text-indigo-500" /> Interview Category / Topic
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {category === 'Custom Category' && (
              <Input
                placeholder="Enter custom topic (e.g. Distributed Systems)..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="text-xs mt-2 bg-muted/40"
              />
            )}
          </div>

          {/* Grid: Difficulty & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Sliders className="h-3.5 w-3.5 text-amber-500" /> Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Award className="h-3.5 w-3.5 text-emerald-500" /> Target Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {EXPERIENCES.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Question Count & Company Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Questions */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <HelpCircle className="h-3.5 w-3.5 text-rose-500" /> Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {QUESTION_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt} Questions
                  </option>
                ))}
              </select>
            </div>

            {/* Company Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/90">
                <Building2 className="h-3.5 w-3.5 text-cyan-500" /> Company Style
              </label>
              <select
                value={companyStyle}
                onChange={(e) => setCompanyStyle(e.target.value)}
                className="w-full bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {COMPANY_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button variant="outline" type="button" onClick={onClose} disabled={isGenerating} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Session with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Custom Interview
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
