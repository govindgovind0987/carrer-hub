import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your CareerHub account',
};

export default function ResetPasswordPage() {
  return (
    <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm Password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/25"
            disabled
          >
            Reset Password
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
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
