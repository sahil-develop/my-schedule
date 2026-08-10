import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FREE_FEATURES = [
  'Daily schedule builder & auto-generated plans',
  'Analytics across days, weeks, and months',
  'DSA practice tracker',
  'Job application tracker',
  'Learning log',
  'Monthly goals & daily summaries',
  'Unlimited tasks and categories',
];

export default function PricingPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-100px] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h1 className="text-4xl font-semibold tracking-tight">Simple pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Everything is free while this is in early access. No trial countdown, no feature paywall.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl shadow-indigo-500/10">
          <Badge className="absolute -top-3 left-8 bg-primary text-primary-foreground">Current plan</Badge>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Free</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">Every feature, free for now.</p>
          <p className="mb-6">
            <span className="text-4xl font-semibold tracking-tight">$0</span>
            <span className="text-muted-foreground"> / forever, for now</span>
          </p>
          <Button size="lg" className="w-full" asChild>
            <Link href="/register">Get started free</Link>
          </Button>
          <ul className="mt-8 space-y-3 text-left">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col justify-between rounded-2xl border border-dashed border-border bg-secondary/30 p-8 opacity-80">
          <div>
            <Badge variant="outline" className="mb-4">
              Coming later
            </Badge>
            <h2 className="text-xl font-semibold">Pro</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              For when this grows beyond a personal tool — team spaces, integrations, priority support.
            </p>
            <p className="mb-6">
              <span className="text-4xl font-semibold tracking-tight text-muted-foreground">TBD</span>
            </p>
          </div>
          <Button size="lg" variant="outline" className="w-full" disabled>
            Not available yet
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Have a question about pricing or what&apos;s coming next?{' '}
          <a href="https://www.linkedin.com/in/sahil02824/" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            Reach out on LinkedIn
          </a>
          .
        </p>
      </div>
    </section>
  );
}
