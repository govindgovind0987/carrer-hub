import { getJobs } from '@/actions/job';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Search,
  DollarSign,
  Clock,
  Filter,
  Bookmark,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Explore Jobs | CareerHub',
  description: 'Search open tech jobs, remote opportunities, and engineering positions.',
};

export default async function JobsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || '';
  const category = params?.category || '';
  const location = params?.location || '';
  const jobType = params?.jobType || '';
  const page = Number(params?.page) || 1;

  const res = await getJobs({ search, category, location, jobType, page, limit: 12 });
  const jobs = res?.jobs || [];
  const totalPages = res?.totalPages || 1;

  const categories = [
    'All Categories',
    'Software Engineering',
    'Frontend Development',
    'Backend Engineering',
    'Full Stack',
    'DevOps & Infrastructure',
    'Data Science & AI',
    'Product Management',
    'UI/UX Design',
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Banner */}
        <section className="bg-gradient-to-b from-violet-600/10 via-background to-background py-12 border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Smart Matching Active
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Find Your Next <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Career Opportunity</span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg">
              Explore thousands of verified listings from top companies and high-growth startups.
            </p>

            {/* Search Bar */}
            <form method="GET" action="/jobs" className="mx-auto max-w-3xl mt-8 flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3 bg-muted/40 rounded-xl">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  name="search"
                  defaultValue={search}
                  placeholder="Job title, keywords, or company..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 bg-muted/40 rounded-xl">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  name="location"
                  defaultValue={location}
                  placeholder="City, state, or Remote..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                />
              </div>

              <Button type="submit" size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl px-8 h-11">
                Search Jobs
              </Button>
            </form>
          </div>
        </section>

        {/* Content Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Filter className="h-4 w-4 text-violet-600" /> Filters
                    </h3>
                    <Link href="/jobs" className="text-xs text-violet-600 hover:underline font-medium">
                      Reset
                    </Link>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                    <div className="space-y-1">
                      {categories.map((cat) => {
                        const catVal = cat === 'All Categories' ? '' : cat;
                        const isSelected = category === catVal;
                        return (
                          <Link
                            key={cat}
                            href={`/jobs?category=${encodeURIComponent(catVal)}&search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`}
                            className={`block text-xs px-3 py-2 rounded-lg transition-colors ${isSelected ? 'bg-violet-600 text-white font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                          >
                            {cat}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{jobs.length}</span> jobs
                </p>
              </div>

              {jobs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
                    <p className="text-sm mt-1">Try adjusting your search criteria or resetting filters.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {jobs.map((job) => (
                    <Card key={job.id} className="group hover:border-violet-500/40 hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
                      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 font-bold">
                                {job.company?.name ? job.company.name.charAt(0) : 'C'}
                              </div>
                              <div>
                                <h4 className="font-bold text-base group-hover:text-violet-600 transition-colors line-clamp-1">
                                  {job.title}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> {job.company?.name || 'Hiring Company'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="secondary" className="text-[10px]">
                              {job.jobType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {job.experienceLevel.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="space-y-1 pt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-violet-500" /> {job.location}
                            </div>
                            {job.salaryMin && (
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / yr
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}
                          </span>

                          <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
                            <Link href={`/jobs/${job.slug}`}>View & Apply</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
