'use client';

import { useState } from 'react';
import { Plus, BookOpen, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useLearningItems, useDeleteLearning } from '@/hooks/useLearning';
import { LearningFormDialog } from '@/components/learning/LearningFormDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LEARNING_STATUS_STYLES, labelize } from '@/lib/badges';
import { errorMessage } from '@/lib/api';
import type { LearningItem } from '@/types';

export default function LearningPage() {
  const { data: items, isLoading } = useLearningItems();
  const deleteLearning = useDeleteLearning();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LearningItem | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(item: LearningItem) {
    setEditing(item);
    setDialogOpen(true);
  }
  async function handleDelete(id: string) {
    try {
      await deleteLearning.mutateAsync(id);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning Tracker</h1>
          <p className="text-sm text-muted-foreground">Skills you're building, and how far along you are.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : !items?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No skills tracked yet"
          description="Add a skill you're learning — Node.js, System Design, AWS, anything — and track your progress."
          actionLabel="Add Skill"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const percent = item.plannedHours ? Math.min(100, Math.round((item.completedHours / item.plannedHours) * 100)) : 0;
            return (
              <Card key={item.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.skill}</p>
                    {item.topic && <p className="truncate text-xs text-muted-foreground">{item.topic}</p>}
                  </div>
                  <Badge variant={LEARNING_STATUS_STYLES[item.status]}>{labelize(item.status)}</Badge>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.completedHours}h / {item.plannedHours}h
                    </span>
                    <span className="font-medium">{percent}%</span>
                  </div>
                  <Progress value={percent} />
                </div>

                {item.targetDate && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Target: {item.targetDate.slice(0, 10)}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-end gap-1 pt-4">
                  <Button size="iconSm" variant="ghost" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="iconSm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <LearningFormDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} />
    </div>
  );
}
