'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

/**
 * Reusable page-level loading component with smooth animation.
 */
export function PageLoader({ className, message = 'Loading...' }) {
  return (
    <motion.div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center gap-4',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Spinner size="lg" className="text-violet-600" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}
