import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignUpForm } from '@/components/forms/sign-up-form';

export const metadata = {
  title: 'Sign Up',
  description: 'Create your CareerHub account',
};

export default function SignUpPage() {
  return (
    <Card className="w-full border-border/50 shadow-sm backdrop-blur-sm bg-card/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Get started with CareerHub for free
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-muted/20" />}>
          <SignUpForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
