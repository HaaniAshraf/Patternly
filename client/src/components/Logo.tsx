export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <circle cx="11" cy="20" r="2.5" className="fill-primary-foreground" />
      <circle cx="16" cy="13" r="2.5" className="fill-primary-foreground" />
      <circle cx="22" cy="17" r="2.5" className="fill-primary-foreground" />
      <path d="M11 20L16 13L22 17" className="stroke-primary-foreground" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
