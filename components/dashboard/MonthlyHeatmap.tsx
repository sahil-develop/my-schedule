'use client';

import { cn } from '@/lib/utils';
import type { MonthlyDay } from '@/types';

interface MonthlyHeatmapProps {
  month: number;
  year: number;
  days: MonthlyDay[];
  onSelectDay?: (date: string) => void;
}

function intensityClass(completionPercent: number, taskCount: number): string {
  if (taskCount === 0) return 'bg-muted/50 text-muted-foreground/50';
  if (completionPercent < 30) return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
  if (completionPercent < 60) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  if (completionPercent < 85) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  return 'bg-emerald-500/30 text-emerald-700 dark:text-emerald-300';
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyHeatmap({ month, year, days, onSelectDay }: MonthlyHeatmapProps) {
  const firstDay = new Date(year, month - 1, 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Monday-first

  const cells: (MonthlyDay | null)[] = [...Array(leadingBlanks).fill(null), ...days];

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) =>
          day ? (
            <button
              key={day.date}
              onClick={() => onSelectDay?.(day.date)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-transform hover:scale-105 hover:ring-2 hover:ring-primary/40',
                intensityClass(day.completionPercent, day.taskCount),
              )}
              title={`${day.date}: ${day.focusHours}h · ${day.completionPercent}%`}
            >
              <span className="font-semibold">{Number(day.date.slice(-2))}</span>
              {day.taskCount > 0 && <span className="text-[9px] opacity-80">{day.focusHours}h</span>}
            </button>
          ) : (
            <div key={`blank-${i}`} />
          ),
        )}
      </div>
      <div className="mt-4 flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/15" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/15" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" /> High
        </span>
      </div>
    </div>
  );
}
