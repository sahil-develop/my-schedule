'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  trend?: string;
  suffix?: string;
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-500',
  blue: 'bg-blue-500/10 text-blue-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  rose: 'bg-rose-500/10 text-rose-500',
  violet: 'bg-violet-500/10 text-violet-500',
};

export function StatCard({ label, value, icon: Icon, accent = 'indigo', trend, suffix }: StatCardProps) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
            {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
