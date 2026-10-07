'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { NotificationDropdown } from '@/components/layout/notification-dropdown';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Building2,
  PlusCircle,
  Users,
  LogOut,
  ChevronDown,
  Sparkles,
  Bot,
  Target,
  Code2,
  HelpCircle,
  Video,
  ShieldCheck,
  Settings,
} from 'lucide-react';
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { getInitials } from '@/lib/utils';

export function DashboardShell({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || 'CANDIDATE';

  // Candidate navigation links (My Workspace is a normal navigation item)
  const candidateLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'My Workspace',
      href: '/dashboard/career-workspace',
      icon: Briefcase,
      isWorkspace: true,
    },
    { label: 'Coding Assessment', href: '/dashboard/assessment', icon: Code2 },
    { label: 'AI Mock Interview', href: '/dashboard/mock-interview', icon: Video },
    { label: 'AI Resume Score', href: '/dashboard/ai-analysis', icon: Bot },
    { label: 'AI Job Matcher', href: '/dashboard/job-match', icon: Target },
    { label: 'AI Career Coach', href: '/dashboard/career-coach', icon: Sparkles },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Recruiter navigation
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

  // Admin navigation
  const adminLinks = [
    { label: 'Admin Control Panel', href: '/dashboard/admin', icon: ShieldCheck },
    { label: 'User Accounts', href: '/dashboard/admin/users', icon: Users },
    { label: 'Recruiter Approvals', href: '/dashboard/admin/recruiters', icon: Building2 },
    { label: 'Platform Analytics', href: '/dashboard/admin/analytics', icon: LayoutDashboard },
    { label: 'Security Audit Logs', href: '/dashboard/admin/logs', icon: FileText },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      localStorage.setItem('careerhub_theme', 'light');
      document.cookie =
        'careerhub_theme=light; path=/; max-age=31536000; SameSite=Lax';
    } catch {
      // ignore
    }
    await signOut({ callbackUrl: '/' });
  };

  const getIsActive = (link) => {
    if (link.isWorkspace) {
      return (
        pathname === '/dashboard/career-workspace' ||
        pathname.startsWith('/dashboard/career-workspace') ||
        pathname.startsWith('/dashboard/resumes') ||
        pathname.startsWith('/dashboard/learning') ||
        pathname.startsWith('/dashboard/skill-progress') ||
        pathname.startsWith('/dashboard/profile')
      );
    }
    if (link.href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(link.href);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Official shadcn/ui Sidebar */}
      <Sidebar collapsible="icon" className="border-r border-border bg-card">
        {/* Sidebar Header with Brand Logo */}
        <SidebarHeader className="border-b border-border/70 p-3 h-14 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden w-full group-data-[collapsible=icon]:justify-center">
            <Logo
              textClassName="group-data-[collapsible=icon]:hidden"
              className="group-data-[collapsible=icon]:justify-center"
            />
          </div>
          <Badge
            variant="secondary"
            className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider group-data-[collapsible=icon]:hidden shrink-0 ml-auto"
          >
            {userRole}
          </Badge>
        </SidebarHeader>

        {/* Sidebar Navigation Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {userRole === 'CANDIDATE'
                ? 'Platform'
                : userRole === 'ADMIN'
                  ? 'Administration'
                  : 'Recruitment'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(userRole === 'CANDIDATE'
                  ? candidateLinks
                  : userRole === 'ADMIN'
                    ? adminLinks
                    : recruiterLinks
                ).map((link) => {
                  const isActive = getIsActive(link);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={link.label}
                      >
                        <Link href={link.href}>
                          <link.icon className="h-4 w-4 shrink-0" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer with User Profile & Sign Out */}
        <SidebarFooter className="border-t border-border/70 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground group-data-[collapsible=icon]:justify-center"
                    tooltip={session?.user?.name || 'Account'}
                  >
                    <Avatar className="h-7 w-7 rounded-md border border-border shrink-0">
                      {session?.user?.image && (
                        <AvatarImage src={session.user.image} />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold rounded-md">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-foreground">
                        {session?.user?.name || 'User'}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-xs">
                      <Avatar className="h-8 w-8 rounded-md">
                        {session?.user?.image && (
                          <AvatarImage src={session.user.image} />
                        )}
                        <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(session?.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-xs leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user?.name}
                        </span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {session?.user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'CANDIDATE' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/career-workspace" className="text-xs cursor-pointer">
                          <Briefcase className="mr-2 h-3.5 w-3.5" /> My Workspace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="text-xs cursor-pointer">
                          <User className="mr-2 h-3.5 w-3.5" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/resumes" className="text-xs cursor-pointer">
                          <FileText className="mr-2 h-3.5 w-3.5" /> My Resumes
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/company" className="text-xs cursor-pointer">
                          <Building2 className="mr-2 h-3.5 w-3.5" /> Company Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/recruiter/jobs" className="text-xs cursor-pointer">
                          <Briefcase className="mr-2 h-3.5 w-3.5" /> Manage Jobs
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="text-xs cursor-pointer">
                      <Settings className="mr-2 h-3.5 w-3.5" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive text-xs cursor-pointer"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main Content Layout with SidebarInset */}
      <SidebarInset className="min-w-0 flex-1">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" />
            <div className="h-4 w-px bg-border mx-1" />
            <Link
              href="/dashboard/career-coach"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="font-medium">AI Career Coach</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
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
                  <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate">
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
                      <Link href="/dashboard/career-workspace" className="text-xs cursor-pointer">
                        <Briefcase className="mr-2 h-3.5 w-3.5" /> My Workspace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="text-xs cursor-pointer">
                        <User className="mr-2 h-3.5 w-3.5" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/resumes" className="text-xs cursor-pointer">
                        <FileText className="mr-2 h-3.5 w-3.5" /> My Resumes
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/company" className="text-xs cursor-pointer">
                        <Building2 className="mr-2 h-3.5 w-3.5" /> Company Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/recruiter/jobs" className="text-xs cursor-pointer">
                        <Briefcase className="mr-2 h-3.5 w-3.5" /> Manage Jobs
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="text-xs cursor-pointer">
                    <Settings className="mr-2 h-3.5 w-3.5" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive text-xs cursor-pointer"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
