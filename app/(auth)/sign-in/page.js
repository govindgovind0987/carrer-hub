import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignInForm } from '@/components/forms/sign-in-form';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your CareerHub account',
};

export default function SignInPage() {
  return (
    <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
