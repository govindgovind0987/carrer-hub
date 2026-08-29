'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FEATURES } from '@/constants';

const iconMap = {
  Brain,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section className="py-24 sm:py-32" id="features">
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
            Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to hire better
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed to streamline every step of your recruitment
            process, from resume screening to candidate placement.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map((feature) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="group h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 transition-all duration-300 group-hover:from-violet-500/20 group-hover:to-indigo-500/20 group-hover:shadow-md group-hover:shadow-violet-500/10">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
