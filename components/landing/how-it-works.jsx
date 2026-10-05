import { Upload, Cpu, Rocket } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/constants';

const icons = [Upload, Cpu, Rocket];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to smarter hiring
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes with our streamlined process.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item, index) => {
            const Icon = icons[index];
            return (
              <div key={item.step} className="relative text-center">
                {/* Connector line (between cards on desktop) */}
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="absolute top-12 left-[60%] hidden h-px w-[80%] bg-border md:block" />
                )}

                {/* Step number + icon */}
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-md border border-border bg-card">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
