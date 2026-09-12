import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">Patternly</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            {user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Log in
                </Link>
                <Button asChild size="sm">
                  <Link to="/register">Start for free</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Patternly. A personal data laboratory.</p>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link to="/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
