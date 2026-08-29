import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export const metadata = {
  title: 'Authentication',
};

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/4 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 sm:p-6">
        <Logo />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="w-full max-w-md px-4 sm:px-0">{children}</div>
    </div>
  );
}
