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

export function Features() {
  return (
    <section className="py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to hire better
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed to streamline every step of your recruitment
            process, from resume screening to candidate placement.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <div key={feature.title}>
                <Card className="group h-full hover:border-primary/30 transition-colors duration-200">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-secondary bg-secondary text-secondary-foreground transition-colors group-hover:border-[#C58B32]">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
