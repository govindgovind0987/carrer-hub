import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  return <DashboardShell>{children}</DashboardShell>;
}

