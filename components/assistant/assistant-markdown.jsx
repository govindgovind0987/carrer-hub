'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AssistantMarkdown({ content }) {
  if (!content) return null;

  // Split content by code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed break-words font-sans">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} code={part.code} language={part.language} />;
        }
        return <FormattedText key={pIdx} text={part.value} />;
      })}
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border/70 bg-zinc-950 text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="uppercase font-semibold tracking-wider text-primary-foreground/80">{language}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3 text-emerald-400" /> Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" /> Copy Code
            </>
          )}
        </Button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedText({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1.5" />;
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lIdx} className="font-semibold text-foreground text-sm pt-2 pb-0.5">
              {renderInlineSpans(trimmed.slice(4))}
            </h4>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lIdx} className="font-bold text-foreground text-base pt-2.5 pb-1 border-b border-border/40">
              {renderInlineSpans(trimmed.slice(3))}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <div className="text-foreground/90">{renderInlineSpans(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="font-mono text-xs font-bold text-primary shrink-0 mt-0.5">{numMatch[1]}.</span>
              <div className="text-foreground/90">{renderInlineSpans(numMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={lIdx} className="text-foreground/90 leading-relaxed">
            {renderInlineSpans(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineSpans(line) {
  // Regex to split on links [text](url), bold **text**, and inline code `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', val: line.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push({ type: 'link', label: linkMatch[1], href: linkMatch[2] });
      }
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push({ type: 'bold', val: token.slice(2, -2) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push({ type: 'inline-code', val: token.slice(1, -1) });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push({ type: 'text', val: line.slice(lastIndex) });
  }

  return parts.map((p, idx) => {
    if (p.type === 'bold') {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {p.val}
        </strong>
      );
    }
    if (p.type === 'inline-code') {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-sm bg-muted text-[12px] font-mono text-foreground border border-border/50"
        >
          {p.val}
        </code>
      );
    }
    if (p.type === 'link') {
      const isInternal = p.href.startsWith('/');
      return isInternal ? (
        <Link
          key={idx}
          href={p.href}
          className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          <span>{p.label}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      ) : (
        <a
          key={idx}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {p.label}
        </a>
      );
    }
    return p.val;
  });
}
