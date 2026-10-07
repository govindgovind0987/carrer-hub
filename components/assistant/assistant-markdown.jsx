'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AssistantMarkdown({ content }) {
  if (!content) return null;

  // Split content into blocks: code blocks, tables, and general text blocks
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-foreground/90 font-sans break-words">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.code} language={block.language} />;
        }
        if (block.type === 'table') {
          return <TableBlock key={idx} headers={block.headers} rows={block.rows} />;
        }
        return <TextBlock key={idx} text={block.value} />;
      })}
    </div>
  );
}

/**
 * Parses markdown into code blocks, tables, and text segments
 */
function parseBlocks(content) {
  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.slice(lastIndex, match.index);
      blocks.push(...parseTablesAndText(textChunk));
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex);
    blocks.push(...parseTablesAndText(remaining));
  }

  return blocks;
}

/**
 * Detects markdown tables inside text segments
 */
function parseTablesAndText(text) {
  const lines = text.split('\n');
  const result = [];
  let currentTextLines = [];
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');

    if (isTableRow) {
      // Check if next line is separator |---|---|
      const isNextSeparator =
        i + 1 < lines.length &&
        lines[i + 1].trim().startsWith('|') &&
        lines[i + 1].includes('---');

      if (!inTable && isNextSeparator) {
        // Table starting
        if (currentTextLines.length > 0) {
          result.push({ type: 'text', value: currentTextLines.join('\n') });
          currentTextLines = [];
        }
        inTable = true;
        tableHeaders = parseTableRowCells(line);
        i++; // skip separator line
        continue;
      } else if (inTable) {
        if (!line.includes('---')) {
          tableRows.push(parseTableRowCells(line));
        }
        continue;
      }
    }

    if (inTable) {
      // Table ended
      result.push({
        type: 'table',
        headers: tableHeaders,
        rows: tableRows,
      });
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    currentTextLines.push(line);
  }

  if (inTable) {
    result.push({
      type: 'table',
      headers: tableHeaders,
      rows: tableRows,
    });
  }

  if (currentTextLines.length > 0) {
    result.push({ type: 'text', value: currentTextLines.join('\n') });
  }

  return result;
}

function parseTableRowCells(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
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
    <div className="my-3 rounded-lg overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="uppercase font-semibold tracking-wider text-zinc-300">{language}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
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

function TableBlock({ headers, rows }) {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-border/70 bg-card shadow-2xs">
      <table className="w-full text-xs text-left border-collapse">
        {headers.length > 0 && (
          <thead className="bg-muted/60 border-b border-border/70 text-foreground font-semibold">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="p-2.5 font-semibold text-foreground">
                  {renderInlineSpans(h)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border/50 text-foreground/90">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 align-top">
                  {renderInlineSpans(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h3 key={lIdx} className="font-semibold text-foreground text-sm sm:text-base mt-2 mb-1 tracking-tight">
              {renderInlineSpans(trimmed.slice(2))}
            </h3>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={lIdx} className="font-semibold text-foreground text-xs sm:text-sm mt-2 mb-0.5 tracking-tight">
              {renderInlineSpans(trimmed.slice(3))}
            </h4>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={lIdx} className="font-medium text-foreground text-xs sm:text-sm mt-1.5 mb-0.5">
              {renderInlineSpans(trimmed.slice(4))}
            </h5>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <div key={lIdx} className="my-2 pl-3 border-l-2 border-border/90 bg-muted/30 py-1.5 pr-2.5 rounded-r-md text-xs italic text-muted-foreground">
              {renderInlineSpans(trimmed.slice(2))}
            </div>
          );
        }

        // Bullet list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lIdx} className="flex items-start gap-2.5 pl-1 py-0.5 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/70 shrink-0" />
              <div className="text-foreground/90">{renderInlineSpans(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lIdx} className="flex items-start gap-2.5 pl-1 py-0.5 leading-relaxed">
              <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">{numMatch[1]}.</span>
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
          className="px-1.5 py-0.5 rounded-sm bg-muted text-[11px] sm:text-xs font-mono text-foreground border border-border/50"
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
          className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-foreground border border-border hover:bg-accent transition-colors"
        >
          <span>{p.label}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
