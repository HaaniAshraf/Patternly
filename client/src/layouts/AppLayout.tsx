import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Search, FlaskConical, Lightbulb, User, Settings, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

const primaryNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/check-in', label: 'Check-in', icon: CalendarCheck },
  { to: '/patterns', label: 'Patterns', icon: Search },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
];

const secondaryNav = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/pricing', label: 'Upgrade', icon: Sparkles },
];

const mobileNav = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/check-in', label: 'Check-in', icon: CalendarCheck },
  { to: '/patterns', label: 'Patterns', icon: Search },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border p-4 md:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Patternly</span>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {primaryNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
          <div className="my-3 border-t border-border" />
          {secondaryNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="border-t border-border pt-3">
          <p className="truncate px-3 text-sm font-medium">{user?.name}</p>
          <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
          <button
            onClick={() => logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 pb-20 md:pb-0">
          <div className="container max-w-5xl py-6 md:py-10">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur md:hidden">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground',
                  isActive && 'text-primary',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground',
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}
