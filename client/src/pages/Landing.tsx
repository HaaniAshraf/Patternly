import { Link } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, FlaskConical, ClipboardCheck, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfidenceBadge } from '@/components/patterns/ConfidenceBadge';

const steps = [
  {
    number: '01',
    title: 'Track',
    icon: ClipboardCheck,
    description: 'Spend less than 30 seconds recording your day.',
  },
  {
    number: '02',
    title: 'Discover',
    icon: Search,
    description: 'Patternly finds interesting relationships in your personal data.',
  },
  {
    number: '03',
    title: 'Test',
    icon: FlaskConical,
    description: 'Turn a pattern into a personal experiment.',
  },
  {
    number: '04',
    title: 'Learn',
    icon: LineChart,
    description: 'Build an evidence-based understanding of yourself.',
  },
];

export function Landing() {
  return (
    <div>
      <section className="container flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> A personal data laboratory
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          What actually makes you better?
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Track a few things about your day. Discover your personal patterns. Test what actually works.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/register">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border bg-secondary/40 py-20">
        <div className="container">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.number} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">{step.number}</div>
                  <step.icon className="mt-3 h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">See a pattern for yourself</h2>
            <p className="mt-2 text-muted-foreground">This is an example — your own patterns come from your own data.</p>
          </div>
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Pattern found
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Example
                </span>
              </div>
              <p className="text-lg font-medium leading-snug">
                You are 26% more productive on days when you exercise.
              </p>
              <p className="text-sm text-muted-foreground">Based on 21 comparable days.</p>
              <div className="flex items-center justify-between pt-1">
                <ConfidenceBadge confidence="moderate" />
                <Button size="sm" variant="outline" disabled>
                  Test this pattern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-20">
        <div className="container flex flex-col items-center gap-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Simple pricing</h2>
          <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <p className="font-medium">Free</p>
                <p className="text-3xl font-semibold">₹0<span className="text-base font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">14 days history · 3 patterns · 1 active experiment</p>
              </CardContent>
            </Card>
            <Card className="border-primary/40">
              <CardContent className="space-y-2 pt-6">
                <p className="font-medium">Pro</p>
                <p className="text-3xl font-semibold">₹299<span className="text-base font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">Unlimited history, patterns &amp; experiments, weekly reports</p>
              </CardContent>
            </Card>
          </div>
          <Button size="lg" asChild>
            <Link to="/register">Start for free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
