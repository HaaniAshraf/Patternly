import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Moon, Zap, Smile, Rocket, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { entriesService } from '@/services/entries.service';
import { useToast } from '@/context/ToastContext';
import { todayLocalDate, hoursMinutesToDecimal, decimalToHoursMinutes } from '@/utils/date';
import { ApiRequestError } from '@/services/api';
import type { DailyEntry } from '@/types';

export function CheckIn() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') ?? todayLocalDate();
  const isToday = dateParam === todayLocalDate();

  const [isLoading, setIsLoading] = useState(true);
  const [existingEntry, setExistingEntry] = useState<DailyEntry | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sleepHours, setSleepHours] = useState(7);
  const [sleepMinutes, setSleepMinutes] = useState(30);
  const [energy, setEnergy] = useState(5);
  const [mood, setMood] = useState(5);
  const [productivity, setProductivity] = useState(5);
  const [exercise, setExercise] = useState(false);
  const [note, setNote] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    entriesService
      .today(dateParam)
      .then(({ entry }) => {
        if (cancelled) return;
        setExistingEntry(entry);
        if (entry) {
          const { hours, minutes } = decimalToHoursMinutes(entry.sleepHours);
          setSleepHours(hours);
          setSleepMinutes(minutes);
          setEnergy(entry.energy);
          setMood(entry.mood);
          setProductivity(entry.productivity);
          setExercise(entry.exercise);
          setNote(entry.note);
        }
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dateParam]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const payload = {
        date: dateParam,
        sleepHours: hoursMinutesToDecimal(sleepHours, sleepMinutes),
        energy,
        mood,
        productivity,
        exercise,
        note,
      };
      const { entry } = existingEntry
        ? await entriesService.update(existingEntry.id, payload)
        : await entriesService.create(payload);
      setExistingEntry(entry);
      if (isToday) {
        setSubmitted(true);
      } else {
        toast({ title: 'Entry updated', variant: 'success' });
        navigate('/check-ins');
      }
    } catch (err) {
      toast({
        title: 'Could not save check-in',
        description: err instanceof ApiRequestError ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (submitted || (existingEntry && isToday)) {
    return (
      <div className="mx-auto max-w-lg animate-slide-up">
        <Card>
          <CardContent className="space-y-4 pt-6 text-center">
            <div className="mx-auto flex h-12 w-12 animate-scale-in items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">You're done for today ✓</h1>
            <div className="grid grid-cols-2 gap-3 text-left text-sm">
              <SummaryRow label="Sleep" value={`${existingEntry?.sleepHours}h`} />
              <SummaryRow label="Energy" value={`${existingEntry?.energy}/10`} />
              <SummaryRow label="Mood" value={`${existingEntry?.mood}/10`} />
              <SummaryRow label="Productivity" value={`${existingEntry?.productivity}/10`} />
              <SummaryRow label="Exercise" value={existingEntry?.exercise ? 'Yes' : 'No'} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSubmitted(false)}>
                Edit entry
              </Button>
              <Button className="flex-1" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Today's check-in</CardTitle>
          <CardDescription>How are you doing today? This takes less than 30 seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" /> Sleep
            </Label>
            <div className="flex items-center gap-3">
              <NumberStepper value={sleepHours} onChange={setSleepHours} min={0} max={16} suffix="h" />
              <NumberStepper value={sleepMinutes} onChange={setSleepMinutes} min={0} max={45} step={15} suffix="m" />
            </div>
          </div>

          <SliderField icon={Zap} label="Energy" value={energy} onChange={setEnergy} />
          <SliderField icon={Smile} label="Mood" value={mood} onChange={setMood} />
          <SliderField icon={Rocket} label="Productivity" value={productivity} onChange={setProductivity} />

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-3">
            <Label className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" /> Exercise
            </Label>
            <Switch checked={exercise} onCheckedChange={setExercise} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Anything unusual today?"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : "Save today's check-in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SliderField({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" /> {label}
        </Label>
        <span className="text-sm font-medium tabular-nums">{value}/10</span>
      </div>
      <Slider value={[value]} min={1} max={10} step={1} onValueChange={([v]) => onChange(v)} aria-label={label} />
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix: string;
}) {
  return (
    <div className="flex items-center rounded-md border border-input">
      <button
        type="button"
        className="px-3 py-2 text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.max(min, value - step))}
        aria-label={`Decrease ${suffix}`}
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-sm tabular-nums">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        className="px-3 py-2 text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.min(max, value + step))}
        aria-label={`Increase ${suffix}`}
      >
        +
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
