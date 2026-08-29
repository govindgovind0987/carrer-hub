/**
 * Application configuration
 */
export const siteConfig = {
  name: 'CareerHub',
  description:
    'AI-powered hiring platform for candidates, recruiters, and admins. Streamline your hiring process with intelligent resume analysis, smart matching, and AI interview preparation.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    twitter: 'https://twitter.com/careerhub',
    github: 'https://github.com/careerhub',
    linkedin: 'https://linkedin.com/company/careerhub',
  },
  creator: 'CareerHub Team',
  keywords: [
    'AI hiring',
    'resume analysis',
    'recruitment',
    'job matching',
    'interview preparation',
    'HR technology',
    'talent acquisition',
    'ATS',
  ],
};

export const authConfig = {
  signInPage: '/sign-in',
  signUpPage: '/sign-up',
  defaultRedirect: '/dashboard',
  publicRoutes: ['/', '/sign-in', '/sign-up'],
  authRoutes: ['/sign-in', '/sign-up'],
  protectedRoutePrefix: '/dashboard',
};
