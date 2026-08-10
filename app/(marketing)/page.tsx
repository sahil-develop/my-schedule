import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileBarChart,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tilt3D } from '@/components/marketing/Tilt3D';

const FEATURES = [
  {
    icon: CalendarClock,
    title: 'Daily schedule',
    description: 'Plan an 8-10 hour focused block by block, and generate a fresh plan whenever your day shifts.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'See where your time actually goes, day over day, category over category — not where you meant it to go.',
  },
  {
    icon: BrainCircuit,
    title: 'DSA practice tracker',
    description: 'Log problems, track patterns, and keep interview prep from quietly stalling out.',
  },
  {
    icon: Briefcase,
    title: 'Job applications',
    description: 'Track every application, stage, and follow-up in one place instead of a scattered spreadsheet.',
  },
  {
    icon: BookOpen,
    title: 'Learning log',
    description: 'Capture what you studied and keep momentum visible across courses, docs, and side projects.',
  },
  {
    icon: Target,
    title: 'Monthly goals',
    description: "Set the month's targets once, then track daily summaries that roll up into real progress.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-[-100px] right-[-80px] h-[400px] w-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Free while in early access
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Your entire day, <span className="text-primary">engineered.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              One place to schedule deep work, track DSA practice and job applications, log what you learn, and see
              whether your month actually went the way you planned it to.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card. Free for now, for everyone.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-6 top-10 h-full w-full rounded-2xl border border-border bg-card/60 shadow-xl" />
            <div className="absolute -right-4 -top-4 h-full w-full rotate-3 rounded-2xl border border-border bg-card/40" />
            <Tilt3D className="relative rounded-2xl">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/[0.08]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Today&apos;s plan</p>
                    <p className="text-xs text-muted-foreground">Tue, Aug 10</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    On track
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Deep work — backend', pct: 100 },
                    { label: 'DSA practice', pct: 70 },
                    { label: 'Job applications', pct: 40 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                          {row.pct === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                          {row.label}
                        </span>
                        <span className="text-muted-foreground">{row.pct}%</span>
                      </div>
                      <Progress value={row.pct} className="h-1.5" />
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">6.5h</p>
                    <p className="text-[10px] text-muted-foreground">Focused</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">12</p>
                    <p className="text-[10px] text-muted-foreground">Day streak</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">3/5</p>
                    <p className="text-[10px] text-muted-foreground">Goals</p>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Everything a deep-work day needs</h2>
            <p className="mt-3 text-muted-foreground">
              Six focused tools, one login. Nothing here is a demo feature — this runs your actual day.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Tilt3D key={feature.title} max={4} className="rounded-2xl">
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-gradient-to-br from-indigo-500 to-violet-600 p-10 text-center shadow-xl shadow-indigo-500/20 sm:p-16">
            <FileBarChart className="h-10 w-10 text-white/90" />
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white">
              Stop guessing where your day went.
            </h2>
            <p className="max-w-md text-white/80">
              Set up your schedule, log your first task, and see today&apos;s summary in under two minutes.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
