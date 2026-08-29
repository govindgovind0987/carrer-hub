'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Reusable empty state component for pages/sections with no data.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Icon && (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      )}
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
