'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WeeklyDay } from '@/types';

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        Completion: <span className="font-medium text-popover-foreground">{payload[0].value}%</span>
      </p>
    </div>
  );
}

export function DailyTrendChart({ days }: { days: WeeklyDay[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={days} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          width={36}
          domain={[0, 100]}
        />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />
        <Line
          type="monotone"
          dataKey="completionPercent"
          name="Completion %"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
