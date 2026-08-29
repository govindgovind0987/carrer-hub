'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signUpSchema } from '@/schemas/auth';
import { registerUser } from '@/actions/auth';
import { FaGithub, FaGoogle } from '@/components/shared/social-icons';

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CANDIDATE',
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await registerUser(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Account created successfully');

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/sign-in');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider) {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={() => handleOAuth('google')}
          disabled={isLoading}
          className="w-full"
        >
          <FaGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuth('github')}
          disabled={isLoading}
          className="w-full"
        >
          <FaGithub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          or continue with
        </span>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isLoading}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isLoading}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role">I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2.5 text-xs font-medium cursor-pointer transition-all hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-foreground has-[:checked]:font-semibold">
              <input
                type="radio"
                value="CANDIDATE"
                className="sr-only"
                {...register('role')}
              />
              Candidate
            </label>
            <label className="flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2.5 text-xs font-medium cursor-pointer transition-all hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-foreground has-[:checked]:font-semibold">
              <input
                type="radio"
                value="RECRUITER"
                className="sr-only"
                {...register('role')}
              />
              Recruiter
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
