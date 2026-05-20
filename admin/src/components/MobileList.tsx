import { cn } from "@/lib/cn";

export function MobileListCard({
  children,
  className,
  footer,
}: {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <article className={cn("rounded-xl border border-slate-800 bg-slate-900/80 p-4", className)}>
      {children}
      {footer ? <div className="mt-4 border-t border-slate-800 pt-4">{footer}</div> : null}
    </article>
  );
}

export function MobileListRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <div className="min-w-0 break-words text-sm text-slate-100">{children}</div>
    </div>
  );
}
