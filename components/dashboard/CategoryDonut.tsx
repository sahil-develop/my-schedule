'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { BUCKET_COLORS, BUCKET_LABELS } from '@/lib/badges';
import { formatHours } from '@/lib/utils';

interface CategoryDonutProps {
  data: { bucket: string; hours: number }[];
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="flex items-center gap-1.5 font-medium text-popover-foreground">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        {BUCKET_LABELS[item.name] ?? item.name}
      </p>
      <p className="text-muted-foreground">{formatHours(item.value)}</p>
    </div>
  );
}

export function CategoryDonut({ data }: CategoryDonutProps) {
  const filtered = data.filter((d) => d.hours > 0);
  const total = filtered.reduce((s, d) => s + d.hours, 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p>No logged time yet this period</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="hours"
              nameKey="bucket"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {filtered.map((entry) => (
                <Cell key={entry.bucket} fill={BUCKET_COLORS[entry.bucket] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-semibold">{formatHours(total)}</p>
          <p className="text-[11px] text-muted-foreground">total</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-1">
        {filtered
          .sort((a, b) => b.hours - a.hours)
          .map((d) => (
            <div key={d.bucket} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: BUCKET_COLORS[d.bucket] ?? '#94a3b8' }}
                />
                {BUCKET_LABELS[d.bucket] ?? d.bucket}
              </span>
              <span className="font-medium">{formatHours(d.hours)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
