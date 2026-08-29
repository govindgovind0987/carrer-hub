'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, Bookmark, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { value: 'ALL', label: 'All DSA Topics' },
  { value: 'Arrays', label: 'Arrays' },
  { value: 'Strings', label: 'Strings' },
  { value: 'Hashing', label: 'Hashing' },
  { value: 'Two Pointers', label: 'Two Pointers' },
  { value: 'Sliding Window', label: 'Sliding Window' },
  { value: 'Binary Search', label: 'Binary Search' },
  { value: 'Linked List', label: 'Linked List' },
  { value: 'Stack', label: 'Stack' },
  { value: 'Queue', label: 'Queue' },
  { value: 'Heap', label: 'Heap' },
  { value: 'Priority Queue', label: 'Priority Queue' },
  { value: 'Binary Tree', label: 'Binary Tree' },
  { value: 'BST', label: 'BST' },
  { value: 'Graphs', label: 'Graphs' },
  { value: 'DFS', label: 'DFS' },
  { value: 'BFS', label: 'BFS' },
  { value: 'Trie', label: 'Trie' },
  { value: 'Greedy', label: 'Greedy' },
  { value: 'Backtracking', label: 'Backtracking' },
  { value: 'Recursion', label: 'Recursion' },
  { value: 'Dynamic Programming', label: 'Dynamic Programming' },
  { value: 'Bit Manipulation', label: 'Bit Manipulation' },
  { value: 'Math', label: 'Math' },
  { value: 'Prefix Sum', label: 'Prefix Sum' },
  { value: 'Union Find', label: 'Union Find' },
  { value: 'Segment Tree', label: 'Segment Tree' },
  { value: 'Fenwick Tree', label: 'Fenwick Tree' },
  { value: 'Sorting', label: 'Sorting' },
  { value: 'Searching', label: 'Searching' },
];

const COMPANIES = [
  { value: 'ALL', label: 'All Companies' },
  { value: 'Google', label: 'Google' },
  { value: 'Microsoft', label: 'Microsoft' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Meta', label: 'Meta' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Netflix', label: 'Netflix' },
  { value: 'Adobe', label: 'Adobe' },
  { value: 'Uber', label: 'Uber' },
  { value: 'Atlassian', label: 'Atlassian' },
  { value: 'Oracle', label: 'Oracle' },
  { value: 'Salesforce', label: 'Salesforce' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Goldman Sachs', label: 'Goldman Sachs' },
  { value: 'Startup', label: 'Startup' },
];

export function CodingProblemFilters({ currentCategory, currentDifficulty, currentSearch, currentStatus, currentCompany, currentBookmarked }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL' && value !== 'false') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search problems by title, tags, or company..."
          defaultValue={currentSearch}
          onChange={(e) => updateParam('search', e.target.value)}
          className="pl-9 bg-card/60 text-xs focus-visible:ring-violet-500"
        />
      </div>

      {/* DSA Topic Dropdown */}
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-violet-500" />
        <select
          value={currentCategory || 'ALL'}
          onChange={(e) => updateParam('category', e.target.value)}
          className="bg-card/80 border border-border/60 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer focus:ring-1 focus:ring-violet-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Company Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={currentCompany || 'ALL'}
          onChange={(e) => updateParam('company', e.target.value)}
          className="bg-card/80 border border-border/60 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer focus:ring-1 focus:ring-violet-500"
        >
          {COMPANIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Dropdown */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={currentDifficulty || 'ALL'}
          onChange={(e) => updateParam('difficulty', e.target.value)}
          className="bg-card/80 border border-border/60 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer focus:ring-1 focus:ring-violet-500"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Status Filter */}
      <select
        value={currentStatus || 'ALL'}
        onChange={(e) => updateParam('status', e.target.value)}
        className="bg-card/80 border border-border/60 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer focus:ring-1 focus:ring-violet-500"
      >
        <option value="ALL">All Status</option>
        <option value="SOLVED">Solved</option>
        <option value="ATTEMPTED">Attempted</option>
        <option value="UNSOLVED">Unsolved</option>
      </select>

      {/* Bookmarked Filter Toggle */}
      <button
        onClick={() => updateParam('bookmarked', currentBookmarked === 'true' ? 'false' : 'true')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
          currentBookmarked === 'true'
            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            : 'bg-card/80 border-border/60 text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className="h-3.5 w-3.5 fill-current" />
        Bookmarked
      </button>
    </div>
  );
}
