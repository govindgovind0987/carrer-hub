import { getJobs } from '@/actions/job';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Briefcase, Building2, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Global Search | CareerHub',
};

export default async function GlobalSearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';

  const [jobsRes, companies] = await Promise.all([
    q ? getJobs({ search: q, limit: 6 }) : { jobs: [] },
    q
      ? prisma.company.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { industry: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 6,
        })
      : [],
  ]);

  const jobs = jobsRes.jobs || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Search Input */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Global Platform Search
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Search across active position listings, technology companies, and skill keywords.
            </p>

            <form method="GET" action="/search" className="mx-auto max-w-2xl flex gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-3 bg-muted/40 rounded-xl">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search jobs, skills, or company name..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl px-6 h-11">
                Search
              </Button>
            </form>
          </div>

          {/* Search Results */}
          {q && (
            <div className="space-y-8">
              {/* Jobs Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/40 pb-2">
                  <Briefcase className="h-5 w-5 text-violet-600" /> Jobs ({jobs.length})
                </h2>

                {jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs matching &quot;{q}&quot;.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {jobs.map((j) => (
                      <Card key={j.id} className="border-border/50 bg-card hover:shadow-md transition-all">
                        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                          <div>
                            <h3 className="font-bold text-base hover:text-violet-600 transition-colors">
                              <Link href={`/jobs/${j.slug}`}>{j.title}</Link>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {j.company?.name || 'Company'} • {j.location}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-border/40 text-xs">
                            <Badge variant="secondary" className="text-[10px]">{j.jobType.replace('_', ' ')}</Badge>
                            <Button asChild size="sm" variant="ghost" className="text-xs text-violet-600">
                              <Link href={`/jobs/${j.slug}`}>View Job <ArrowRight className="ml-1 h-3 w-3" /></Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Companies Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/40 pb-2">
                  <Building2 className="h-5 w-5 text-violet-600" /> Companies ({companies.length})
                </h2>

                {companies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No companies matching &quot;{q}&quot;.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {companies.map((c) => (
                      <Card key={c.id} className="border-border/50 bg-card">
                        <CardContent className="p-4 space-y-2">
                          <h4 className="font-bold text-base">{c.name}</h4>
                          <p className="text-xs text-muted-foreground">{c.industry || 'Technology'}</p>
                          {c.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
