'use client';

import { useState } from 'react';
import { Plus, BrainCircuit, CheckCircle2, CalendarDays, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDsaProblems, useDsaStats, useDeleteDsa } from '@/hooks/useDsa';
import { DsaFormDialog } from '@/components/dsa/DsaFormDialog';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DIFFICULTY_STYLES, DSA_STATUS_STYLES, labelize } from '@/lib/badges';
import { formatMinutes } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import type { DsaProblem } from '@/types';

export default function DsaPage() {
  const { data: problems, isLoading } = useDsaProblems();
  const { data: stats } = useDsaStats();
  const deleteDsa = useDeleteDsa();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DsaProblem | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(p: DsaProblem) {
    setEditing(p);
    setDialogOpen(true);
  }
  async function handleDelete(id: string) {
    try {
      await deleteDsa.mutateAsync(id);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">DSA Tracker</h1>
          <p className="text-sm text-muted-foreground">Consistency compounds. Track every problem you touch.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Log Problem
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatCard label="Solved Today" value={stats.solvedToday} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Solved This Week" value={stats.solvedThisWeek} icon={CalendarDays} accent="blue" />
            <StatCard label="Solved This Month" value={stats.solvedThisMonth} icon={BrainCircuit} accent="indigo" />
            <StatCard label="Revision Pending" value={stats.revisionPending} icon={RotateCcw} accent="amber" />
          </>
        )}
      </div>

      {stats && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 p-5">
            <p className="text-sm font-medium text-muted-foreground">Total solved: {stats.totalSolved}</p>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="success">Easy {stats.easy}</Badge>
              <Badge variant="warning">Medium {stats.medium}</Badge>
              <Badge variant="destructive">Hard {stats.hard}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !problems?.length ? (
            <div className="p-6">
              <EmptyState
                icon={BrainCircuit}
                title="No problems logged yet"
                description="Start tracking your DSA practice — log your first problem to see stats here."
                actionLabel="Log Problem"
                onAction={openAdd}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Problem</th>
                    <th className="px-5 py-3 font-medium">Topic</th>
                    <th className="px-5 py-3 font-medium">Difficulty</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <p className="font-medium">{p.problem}</p>
                        {p.platform && <p className="text-xs text-muted-foreground">{p.platform}</p>}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.topic}</td>
                      <td className="px-5 py-3">
                        <Badge variant={DIFFICULTY_STYLES[p.difficulty]}>{labelize(p.difficulty)}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={DSA_STATUS_STYLES[p.status]}>{labelize(p.status)}</Badge>
                          {p.revisionRequired && <RotateCcw className="h-3.5 w-3.5 text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatMinutes(p.timeSpentMinutes)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.date.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="iconSm" variant="ghost" onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="iconSm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <DsaFormDialog open={dialogOpen} onOpenChange={setDialogOpen} problem={editing} />
    </div>
  );
}
