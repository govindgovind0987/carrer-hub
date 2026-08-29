'use client';

import { useState } from 'react';
import { ProblemPanel } from './problem-panel';
import { EditorConsolePanel } from './editor-console-panel';
import { toast } from 'sonner';

export function LeetCodeWorkspace({ problem, userProgress, previousSubmissions = [], similarProblems = {} }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(
    problem.starterCode?.[language] || problem.starterCode?.['python'] || ''
  );
  const [customInput, setCustomInput] = useState(problem.examples?.[0]?.input || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionsList, setSubmissionsList] = useState(previousSubmissions);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
      toast.info('Code reset to default starter template');
    }
  };

  const handleRunCode = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/assessment/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          customInput,
          timeLimitMs: problem.timeLimitMs,
          memoryLimitMb: problem.memoryLimitMb,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setExecutionResult(data);
      if (data.success) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Execution completed with errors.');
      }
    } catch (err) {
      toast.error(err.message || 'Error running code');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitSolution = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmissionResult(data);

      if (data.submission) {
        setSubmissionsList([data.submission, ...submissionsList]);
      }

      if (data.verdict === 'ACCEPTED') {
        toast.success(`🎉 Accepted! Passed ${data.passedCases}/${data.totalCases} test cases!`);
      } else {
        toast.error(`Verdict: ${data.verdict.replace(/_/g, ' ')}`);
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting solution');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] p-2 sm:p-4 bg-background">
      {/* 2-Panel Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
        {/* Left Panel: Problem Statement, Tabs, 10 Sample Test cases, 20+ Hidden Summary (5 cols) */}
        <div className="lg:col-span-5 h-full overflow-hidden">
          <ProblemPanel
            problem={problem}
            userProgress={userProgress}
            submissions={submissionsList}
            similarProblems={similarProblems}
            code={code}
            language={language}
          />
        </div>

        {/* Right Panel: Editor, Action Bar, Bottom Console (7 cols) */}
        <div className="lg:col-span-7 h-full overflow-hidden">
          <EditorConsolePanel
            problem={problem}
            language={language}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={setCode}
            onResetCode={handleResetCode}
            isEvaluating={isEvaluating}
            onRunCode={handleRunCode}
            onSubmitSolution={handleSubmitSolution}
            executionResult={executionResult}
            submissionResult={submissionResult}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
          />
        </div>
      </div>
    </div>
  );
}
