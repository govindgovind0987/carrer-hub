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
    <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Get started with CareerHub for free
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
