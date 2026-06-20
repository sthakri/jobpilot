import Link from "next/link";
import { ArrowRightIcon } from "./ArrowRightIcon";

export function Hero() {
  return (
    <section className="bg-background pt-12 pb-8">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="rounded-2xl bg-gradient-to-br from-accent-light/50 to-info-light/50 px-8 py-16 text-center">
          <h1 className="text-5xl font-semibold text-text-primary tracking-tight max-w-3xl mx-auto leading-tight">
            Job hunting is hard.
            <br />
            Your tools shouldn&apos;t be.
          </h1>

          <p className="mt-5 text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
            Stop applying blind. JobPilot finds the jobs, researches the
            companies, and gives you everything you need to stand out.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-foreground bg-overlay-dark px-4 py-2 rounded-md hover:bg-overlay transition-colors"
            >
              Get Started
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-text-primary bg-surface border border-border px-4 py-2 rounded-md hover:bg-surface-secondary transition-colors"
            >
              Find Your First Match
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
