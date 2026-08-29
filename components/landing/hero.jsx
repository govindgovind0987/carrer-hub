'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Clean Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>AI Career & Hiring Platform</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mx-auto max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Prepare, Match, and Elevate Your Technical Career
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Transform your job preparation with AI-powered resume auditing,
          intelligent ATS matching, sandboxed coding challenges, and personalized career roadmaps.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button
            size="lg"
            asChild
            className="px-6 h-10 text-xs sm:text-sm font-semibold"
          >
            <Link href={isAuthenticated ? '/dashboard' : '/sign-up'}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-6 h-10 text-xs sm:text-sm font-semibold"
            asChild
          >
            <Link href="/#features">Learn More</Link>
          </Button>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Trusted by industry-leading companies
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-40">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map(
              (company) => (
                <span
                  key={company}
                  className="text-lg font-semibold tracking-tight text-muted-foreground"
                >
                  {company}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
