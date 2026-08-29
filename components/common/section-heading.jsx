'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Reusable section heading component for consistent section headers across pages.
 */
export function SectionHeading({
  label,
  title,
  description,
  align = 'center',
  className,
}) {
  return (
    <motion.div
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {label && (
        <h2 className="text-sm font-semibold uppercase tracking-widest text-violet-600">
          {label}
        </h2>
      )}
      {title && (
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </p>
      )}
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
    </motion.div>
  );
}
