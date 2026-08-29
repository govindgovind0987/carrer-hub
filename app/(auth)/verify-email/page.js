import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Verify Email',
  description: 'Verify your email address for CareerHub',
};

export default function VerifyEmailPage() {
  return (
    <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
          <MailCheck className="h-6 w-6 text-violet-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          disabled
        >
          Resend Verification Email
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
