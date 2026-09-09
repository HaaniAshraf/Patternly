import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Search, CalendarCheck, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PatternCard } from '@/components/patterns/PatternCard';
import { useAuth } from '@/context/AuthContext';
import { entriesService } from '@/services/entries.service';
import { patternsService } from '@/services/patterns.service';
import { greetingForNow, todayLocalDate, formatDisplayDate } from '@/utils/date';
import type { DailyEntry, Pattern } from '@/types';

const CONFIDENCE_ORDER: Record<Pattern['confidence'], number> = { strong: 3, moderate: 2, weak: 1, insufficient: 0 };

export function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[] | null>(null);
  const [patterns, setPatterns] = useState<Pattern[] | null>(null);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);

  useEffect(() => {
    entriesService.list().then(({ entries }) => setEntries(entries));
    patternsService.list().then(({ patterns }) => setPatterns(patterns));
    entriesService.today(todayLocalDate()).then(({ entry }) => setTodayEntry(entry));
  }, []);

  const sortedAsc = useMemo(() => (entries ? [...entries].sort((a, b) => a.date.localeCompare(b.date)) : []), [entries]);

  const weeklyStats = useMemo(() => computeWeeklyStats(sortedAsc), [sortedAsc]);
  const topPattern = useMemo(() => {
    if (!patterns) return null;
    const active = patterns.filter((p) => p.confidence !== 'insufficient');
    if (active.length === 0) return null;
    return [...active].sort((a, b) => CONFIDENCE_ORDER[b.confidence] - CONFIDENCE_ORDER[a.confidence])[0];
  }, [patterns]);

  const chartData = sortedAsc.slice(-21).map((e) => ({
    date: formatDisplayDate(e.date),
    productivity: e.productivity,
    sleepHours: e.sleepHours,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greetingForNow()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">Here's how your patterns are shaping up.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          {todayEntry ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Today's check-in completed</p>
                  <p className="text-sm text-muted-foreground">Nice work — consistency is what builds evidence.</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/check-in">View today's entry</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Today's check-in</p>
                  <p className="text-sm text-muted-foreground">How are you doing today?</p>
                </div>
              </div>
              <Button asChild>
                <Link to="/check-in">Complete check-in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {entries === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Sleep" value={weeklyStats?.sleep} suffix="h" precision={1} />
          <MetricCard label="Energy" value={weeklyStats?.energy} suffix="/10" precision={1} />
          <MetricCard label="Mood" value={weeklyStats?.mood} suffix="/10" precision={1} />
          <MetricCard label="Productivity" value={weeklyStats?.productivity} suffix="/10" precision={1} />
        </div>
      )}

      {entries !== null && entries.length >= 3 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Productivity over time" data={chartData} dataKey="productivity" domain={[1, 10]} />
          <ChartCard title="Sleep over time" data={chartData} dataKey="sleepHours" domain={[0, 12]} />
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Pattern preview</h2>
          <Link to="/patterns" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {patterns === null ? (
          <Skeleton className="h-48 w-full" />
        ) : topPattern ? (
          <PatternCard pattern={topPattern} />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="We're still learning"
            description="Complete more check-ins and we'll start looking for meaningful patterns."
          />
        )}
      </div>
    </div>
  );
}

function computeWeeklyStats(sortedAsc: DailyEntry[]) {
  if (sortedAsc.length === 0) return null;
  const last7 = sortedAsc.slice(-7);
  const prev7 = sortedAsc.slice(-14, -7);

  const avg = (arr: DailyEntry[], key: keyof DailyEntry) =>
    arr.length ? arr.reduce((sum, e) => sum + (e[key] as number), 0) / arr.length : null;

  return {
    sleep: { current: avg(last7, 'sleepHours'), previous: avg(prev7, 'sleepHours') },
    energy: { current: avg(last7, 'energy'), previous: avg(prev7, 'energy') },
    mood: { current: avg(last7, 'mood'), previous: avg(prev7, 'mood') },
    productivity: { current: avg(last7, 'productivity'), previous: avg(prev7, 'productivity') },
  };
}

function MetricCard({
  label,
  value,
  suffix,
  precision,
}: {
  label: string;
  value: { current: number | null; previous: number | null } | undefined;
  suffix: string;
  precision: number;
}) {
  const hasTrend = value?.previous !== null && value?.previous !== undefined && value.previous !== 0;
  const change = hasTrend && value ? ((value.current! - value.previous!) / value.previous!) * 100 : null;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        {value?.current == null ? (
          <p className="mt-2 text-sm text-muted-foreground">Keep checking in to see your trend.</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-semibold">
              {value.current.toFixed(precision)}
              <span className="text-base font-normal text-muted-foreground">{suffix}</span>
            </p>
            {change !== null && (
              <p className={`mt-1 flex items-center gap-1 text-sm ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {change >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                {Math.abs(change).toFixed(0)}%
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
  domain,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  domain: [number, number];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={domain} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: 'hsl(var(--border))', fontSize: 12 }}
            />
            <Line type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
