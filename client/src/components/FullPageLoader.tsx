import { Logo } from './Logo';

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <Logo className="h-10 w-10" />
      </div>
    </div>
  );
}
