'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WeeklyDay } from '@/types';

interface WeeklyBarChartProps {
  days: WeeklyDay[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
          {p.name}: <span className="font-medium text-popover-foreground">{p.value}h</span>
        </p>
      ))}
    </div>
  );
}

export function WeeklyBarChart({ days }: WeeklyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={days} barGap={4} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={32} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Bar dataKey="plannedHours" name="Planned" fill="hsl(var(--muted-foreground) / 0.25)" radius={[6, 6, 6, 6]} maxBarSize={22} />
        <Bar dataKey="completedHours" name="Completed" fill="hsl(var(--primary))" radius={[6, 6, 6, 6]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
