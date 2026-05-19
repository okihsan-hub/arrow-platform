import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm", className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {desc ? <p className="mt-0.5 text-sm text-slate-400">{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function Button({
  children,
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-500",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
    danger: "bg-red-600/90 text-white hover:bg-red-500",
    ghost: "text-slate-300 hover:bg-slate-800",
  };
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
        props.className,
      )}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
      {children}
    </label>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none",
        props.className,
      )}
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none",
        props.className,
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const tones = {
    default: "bg-slate-800 text-slate-200",
    success: "bg-emerald-900/60 text-emerald-200",
    warn: "bg-amber-900/50 text-amber-200",
    danger: "bg-red-900/50 text-red-200",
  };
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold uppercase", tones[tone])}>
      {children}
    </span>
  );
}

export function statusTone(status: string): "success" | "warn" | "danger" | "default" {
  if (status === "active") return "success";
  if (status === "suspended" || status === "expired") return "warn";
  if (status === "cancelled") return "danger";
  return "default";
}
