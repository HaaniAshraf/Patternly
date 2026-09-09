import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Zap, Smile, Rocket, Dumbbell, Pencil, Trash2, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { entriesService } from '@/services/entries.service';
import { useToast } from '@/context/ToastContext';
import { formatDisplayDate } from '@/utils/date';
import type { DailyEntry } from '@/types';

export function CheckInHistory() {
  const [entries, setEntries] = useState<DailyEntry[] | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  function load() {
    entriesService.list().then(({ entries }) => setEntries(entries));
  }

  useEffect(load, []);

  async function confirmDelete() {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await entriesService.remove(entryToDelete.id);
      setEntries((prev) => prev?.filter((e) => e.id !== entryToDelete.id) ?? null);
      toast({ title: 'Entry deleted' });
    } catch {
      toast({ title: 'Could not delete entry', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Check-in history</h1>
        <p className="mt-1 text-muted-foreground">Every day you've logged, in one place.</p>
      </div>

      {entries === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No check-ins yet"
          description="Complete your first check-in to start building your history."
          action={
            <Button asChild>
              <Link to="/check-in">Complete today's check-in</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{formatDisplayDate(entry.date)}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5" /> {entry.sleepHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> {entry.energy}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <Smile className="h-3.5 w-3.5" /> {entry.mood}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <Rocket className="h-3.5 w-3.5" /> {entry.productivity}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5" /> {entry.exercise ? 'Exercised' : 'No exercise'}
                    </span>
                  </div>
                  {entry.note && <p className="truncate text-sm text-muted-foreground">"{entry.note}"</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/check-in?date=${entry.date}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEntryToDelete(entry)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>
              This will permanently remove your check-in for {entryToDelete && formatDisplayDate(entryToDelete.date)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
