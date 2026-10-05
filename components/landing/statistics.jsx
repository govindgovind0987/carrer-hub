import { STATISTICS } from '@/constants';

export function Statistics() {
  return (
    <section className="relative overflow-hidden border-y border-[#29465C] bg-[#18364D] py-20 sm:py-24">

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATISTICS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-semibold text-white sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-white/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
