import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { billingService } from '@/services/billing.service';
import { ApiRequestError } from '@/services/api';

const freeFeatures = ['14 days history', '3 detected patterns', '1 active experiment', 'Basic weekly summary'];
const proFeatures = [
  'Unlimited history',
  'Unlimited patterns',
  'Unlimited experiments',
  'Advanced pattern analysis',
  'AI explanations',
  'Weekly reports',
  'Personal insights',
  'Data export',
];

export function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingCycle, setLoadingCycle] = useState<'monthly' | 'annual' | null>(null);

  async function handleUpgrade(planCycle: 'monthly' | 'annual') {
    setLoadingCycle(planCycle);
    try {
      await billingService.createSubscription(planCycle);
      toast({
        title: 'Redirecting to checkout',
        description: 'Complete payment with Razorpay to activate Pro.',
      });
    } catch (err) {
      toast({
        title: 'Could not start checkout',
        description: err instanceof ApiRequestError ? err.message : 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCycle(null);
    }
  }

  return (
    <div className="container max-w-4xl py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
        <p className="mt-2 text-muted-foreground">Start free. Upgrade when you're ready to go deeper.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <p className="text-3xl font-semibold">
              ₹0<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            {!user && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">Start for free</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/40 shadow-md">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <p className="text-3xl font-semibold">
              ₹299<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-xs text-muted-foreground">or ₹2,499/year — save ~30%</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            {user ? (
              user.plan === 'pro' ? (
                <Button className="w-full" disabled>
                  You're on Pro
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => handleUpgrade('monthly')} disabled={loadingCycle !== null}>
                    {loadingCycle === 'monthly' ? 'Starting checkout…' : 'Upgrade monthly'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade('annual')}
                    disabled={loadingCycle !== null}
                  >
                    {loadingCycle === 'annual' ? 'Starting checkout…' : 'Upgrade annually'}
                  </Button>
                </div>
              )
            ) : (
              <Button className="w-full" asChild>
                <Link to="/register">Start for free</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
