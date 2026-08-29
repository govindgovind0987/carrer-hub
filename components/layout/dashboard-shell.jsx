'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { NotificationDropdown } from '@/components/layout/notification-dropdown';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Send,
  Bookmark,
  Building2,
  PlusCircle,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Bot,
  Target,
  Code2,
  HelpCircle,
  Video,
  ShieldCheck,
  Settings,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn, getInitials } from '@/lib/utils';

export function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || 'CANDIDATE';

  const candidateLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Mock Interview', href: '/dashboard/mock-interview', icon: Video },
    { label: 'AI Resume Score', href: '/dashboard/ai-analysis', icon: Bot },
    { label: 'AI Job Matcher', href: '/dashboard/job-match', icon: Target },
    { label: 'Coding Assessment', href: '/dashboard/assessment', icon: Code2 },
    { label: 'HR & Tech Questions', href: '/dashboard/interview-prep', icon: HelpCircle },
    { label: 'My Learning', href: '/dashboard/learning', icon: BookOpen },
    { label: 'Skill Progress', href: '/dashboard/skill-progress', icon: TrendingUp },
    { label: 'AI Career Coach', href: '/dashboard/career-coach', icon: Sparkles },
    { label: 'My Profile', href: '/dashboard/profile', icon: User },
    { label: 'My Resumes', href: '/dashboard/resumes', icon: FileText },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const recruiterLinks = [
    { label: 'Recruiter Dashboard', href: '/dashboard/recruiter', icon: LayoutDashboard },
    { label: 'Coding Assessments', href: '/dashboard/recruiter/assessments', icon: Code2 },
    { label: 'Post New Job', href: '/dashboard/recruiter/jobs/create', icon: PlusCircle },
    { label: 'Manage Jobs', href: '/dashboard/recruiter/jobs', icon: Briefcase },
    { label: 'Review Applicants', href: '/dashboard/recruiter/applicants', icon: Users },
    { label: 'Company Profile', href: '/dashboard/company', icon: Building2 },
    { label: 'Browse Candidates', href: '/candidates', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminLinks = [
    { label: 'Admin Control Panel', href: '/dashboard/admin', icon: ShieldCheck },
    { label: 'User Accounts', href: '/dashboard/admin/users', icon: Users },
    { label: 'Recruiter Approvals', href: '/dashboard/admin/recruiters', icon: Building2 },
    { label: 'Platform Analytics', href: '/dashboard/admin/analytics', icon: LayoutDashboard },
    { label: 'Security Audit Logs', href: '/dashboard/admin/logs', icon: FileText },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const links = userRole === 'ADMIN' ? adminLinks : userRole === 'RECRUITER' ? recruiterLinks : candidateLinks;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card z-30">
        <div className="flex h-14 items-center justify-between px-5 border-b border-border">
          <Logo />
          <Badge variant="secondary" className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            {userRole}
          </Badge>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                <link.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-60">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Link href="/dashboard/career-coach" className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-2.5 py-1 rounded-md bg-card">
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              <span className="font-medium">AI Career Coach</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <NotificationDropdown />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 hover:bg-accent rounded-md">
                  <Avatar className="h-7 w-7 border border-border">
                    {session?.user?.image && <AvatarImage src={session.user.image} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-medium">
                    {session?.user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold leading-none">{session?.user?.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-none">{session?.user?.email}</p>
                    <span className="mt-1 inline-flex items-center w-max text-[10px] font-medium text-muted-foreground">
                      Role: {userRole}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 'CANDIDATE' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="text-xs">
                        <User className="mr-2 h-3.5 w-3.5" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/resumes" className="text-xs">
                        <FileText className="mr-2 h-3.5 w-3.5" /> My Resumes
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/company" className="text-xs">
                        <Building2 className="mr-2 h-3.5 w-3.5" /> Company Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/recruiter/jobs" className="text-xs">
                        <Briefcase className="mr-2 h-3.5 w-3.5" /> Manage Jobs
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-destructive focus:text-destructive text-xs cursor-pointer"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-card md:hidden flex flex-col"
              >
                <div className="flex h-14 items-center justify-between px-5 border-b border-border">
                  <Logo />
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    {userRole}
                  </Badge>
                </div>
                <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
