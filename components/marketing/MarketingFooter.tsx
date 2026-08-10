import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Productivity OS</p>
            <p className="text-xs text-muted-foreground">Built for deep work.</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <a href="https://github.com/sahil-develop" target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
        </nav>

        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Productivity OS. Made by Sahil.</p>
      </div>
    </footer>
  );
}
