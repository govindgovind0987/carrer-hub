'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, BookOpen, Loader2 } from 'lucide-react';

const getDifficultyBadge = (diff) => {
  if (diff === 'EASY') return <Badge variant="success">Easy</Badge>;
  if (diff === 'MEDIUM') return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="destructive">Hard</Badge>;
};

export function ProblemInfiniteList({
  initialProblems = [],
  totalCount = 0,
  filters = {},
}) {
  const [problems, setProblems] = useState(initialProblems);
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState(
    initialProblems.length > 0
      ? initialProblems[initialProblems.length - 1].id
      : null
  );
  const [hasMore, setHasMore] = useState(initialProblems.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const seenIdsRef = useRef(new Set(initialProblems.map((p) => p.id)));


  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      const currentFilters = filtersRef.current || {};
      if (currentFilters.category && currentFilters.category !== 'ALL')
        params.set('category', currentFilters.category);
      if (currentFilters.difficulty && currentFilters.difficulty !== 'ALL')
        params.set('difficulty', currentFilters.difficulty);
      if (currentFilters.company && currentFilters.company !== 'ALL')
        params.set('company', currentFilters.company);
      if (currentFilters.search && currentFilters.search.trim())
        params.set('search', currentFilters.search.trim());
      if (currentFilters.status && currentFilters.status !== 'ALL')
        params.set('status', currentFilters.status);
      if (currentFilters.bookmarked) params.set('bookmarked', 'true');

      params.set('page', String(nextPage));
      params.set('limit', '20');
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/assessment/problems?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch more problems');

      const data = await res.json();
      const newItems = data.problems || [];

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        const uniqueItems = [];
        for (const item of newItems) {
          if (!seenIdsRef.current.has(item.id)) {
            seenIdsRef.current.add(item.id);
            uniqueItems.push(item);
          }
        }

        setProblems((prev) => [...prev, ...uniqueItems]);
        setPage(nextPage);
        const last = newItems[newItems.length - 1];
        setCursor(last?.id || null);

        if (data.pagination) {
          setHasMore(Boolean(data.pagination.hasMore));
        } else {
          setHasMore(newItems.length >= 20);
        }
      }
    } catch (err) {
      console.error('Failed to load more problems:', err);
      setError('Failed to load more problems. Click to retry.');
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [hasMore, page, cursor]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const descriptionText =
    totalCount === 0
      ? 'No practice problems found'
      : problems.length >= totalCount
        ? `Showing all ${totalCount} practice problems across DSA, System Design, SQL, and Full-Stack`
        : `Showing ${problems.length} of ${totalCount} practice problems across DSA, System Design, SQL, and Full-Stack`;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Coding Challenges Database
            </CardTitle>
            <CardDescription className="text-xs">
              {descriptionText}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {problems.length > 0 ? (
            problems.map((problem) => {
              const status = problem.userStatus || 'UNSOLVED';
              return (
                <div
                  key={problem.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {status === 'SOLVED' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <Link
                        href={`/dashboard/assessment/problems/${problem.slug}`}
                        className="font-semibold text-sm text-foreground hover:underline"
                      >
                        {problem.title}
                      </Link>
                      {getDifficultyBadge(problem.difficulty)}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {problem.category}
                      </Badge>
                      {Array.isArray(problem.tags) &&
                        problem.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-muted px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-muted-foreground hidden md:block">
                      <p className="font-semibold text-foreground">
                        {problem.acceptanceRate}% Rate
                      </p>
                      <p className="text-[10px]">
                        {problem.totalSubmissions} Submissions
                      </p>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      variant={status === 'SOLVED' ? 'outline' : 'default'}
                    >
                      <Link
                        href={`/dashboard/assessment/problems/${problem.slug}`}
                      >
                        {status === 'SOLVED' ? 'Re-Solve' : 'Solve'}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs">
                No coding problems found matching your filters.
              </p>
            </div>
          )}

          {/* Loading indicator during infinite scroll */}
          {isLoadingMore && (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading next challenges...</span>
            </div>
          )}

          {/* Retry on network error */}
          {error && (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs text-destructive">{error}</span>
              <Button size="sm" variant="outline" onClick={loadMore}>
                Retry
              </Button>
            </div>
          )}

          {/* End of list confirmation */}
          {!hasMore && problems.length > 20 && (
            <div className="py-4 text-center text-xs text-muted-foreground/60">
              All {totalCount} coding challenges loaded
            </div>
          )}

          {/* Invisible sentinel element for scroll observation */}
          {hasMore && !isLoadingMore && (
            <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
