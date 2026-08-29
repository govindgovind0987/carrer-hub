'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, Rocket } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/constants';

const icons = [Upload, Cpu, Rocket];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to smarter hiring
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes with our streamlined process.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Connector line (between cards on desktop) */}
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="absolute top-12 left-[60%] hidden h-[2px] w-[80%] bg-gradient-to-r from-violet-500/30 to-transparent md:block" />
                )}

                {/* Step number + icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 relative">
                  <Icon className="h-10 w-10 text-violet-600" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
