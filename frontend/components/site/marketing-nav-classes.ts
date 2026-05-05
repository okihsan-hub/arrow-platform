/** Match admin sidebar link treatment (rounded-md + accent pill when active). */

export function marketingNavLinkClass(active: boolean): string {
  return active
    ? "rounded-md bg-corporate-accent px-3 py-2 text-sm font-medium text-white"
    : "rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white";
}

export function footerNavLinkClass(active: boolean): string {
  return active
    ? "text-corporate-accent underline decoration-corporate-accent/50 underline-offset-4"
    : "text-slate-400 transition hover:text-white";
}
