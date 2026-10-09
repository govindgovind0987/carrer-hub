'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signUpSchema } from '@/schemas/auth';
import { registerUser } from '@/actions/auth';
import { FaGithub, FaGoogle } from '@/components/shared/social-icons';

const OAUTH_ERROR_MESSAGES = {
  OAuthSignin: 'Could not construct authorization URL. Please check server OAuth credentials.',
  OAuthCallback: 'Error processing OAuth response. Please try signing in again.',
  OAuthCreateAccount: 'Could not create your user account with this provider. Please try again.',
  Callback: 'Authentication callback error. Please try again.',
  OAuthAccountNotLinked:
    'An account with this email already exists with a different sign-in method. Please sign in with your email and password.',
  AccessDenied: 'Access was denied. Authorization may have been cancelled or an email address was not provided.',
  Configuration:
    'OAuth provider is not configured properly on the server. Please check environment variables.',
  EmailSignin: 'No verified email address was provided by the authentication provider.',
  Default: 'Could not sign in with this provider. Please try again.',
};

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'github' | null
  const [actionError, setActionError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const urlError = searchParams.get('error');

  const derivedUrlError = urlError
    ? OAUTH_ERROR_MESSAGES[urlError] || OAUTH_ERROR_MESSAGES.Default
    : null;
  const oauthError = actionError || derivedUrlError;

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
    setActionError(null);
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

      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider) {
    setOauthLoading(provider);
    setActionError(null);
    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
      if (result?.error) {
        const message =
          OAUTH_ERROR_MESSAGES[result.error] || OAUTH_ERROR_MESSAGES.Default;
        setActionError(message);
        toast.error(message);
        setOauthLoading(null);
      }
    } catch (err) {
      console.error(`Error during ${provider} sign up:`, err);
      const providerLabel = provider === 'github' ? 'GitHub' : 'Google';
      const message = `Could not start ${providerLabel} sign up. Please try again.`;
      setActionError(message);
      toast.error(message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Error alert banner */}
      {oauthError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-destructive" />
          <div className="space-y-0.5">
            <p className="font-semibold text-xs uppercase tracking-wider">
              Authentication Notice
            </p>
            <p className="text-xs text-destructive/90">{oauthError}</p>
          </div>
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth('google')}
          disabled={isLoading || oauthLoading !== null}
          className="w-full relative"
          aria-label="Continue with Google"
          aria-busy={oauthLoading === 'google'}
        >
          {oauthLoading === 'google' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <FaGoogle className="mr-2 h-4 w-4" />
              <span>Google</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth('github')}
          disabled={isLoading || oauthLoading !== null}
          className="w-full relative"
          aria-label="Continue with GitHub"
          aria-busy={oauthLoading === 'github'}
        >
          {oauthLoading === 'github' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <FaGithub className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </>
          )}
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
