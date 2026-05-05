/** Shared skeleton for marketing route loading.tsx files. */

export type MarketingSkeletonVariant = "default" | "grid" | "split";

export function MarketingPageSkeleton({ variant = "default" }: { variant?: MarketingSkeletonVariant }) {
  if (variant === "grid") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-xl animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-800/80" />
          <div className="h-10 w-full max-w-md rounded-lg bg-slate-800/80" />
          <div className="h-24 w-full rounded-lg bg-slate-800/60" />
        </div>
        <ul className="mt-14 grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <li key={k} className="rounded-xl border border-slate-800/50 bg-slate-900/20 p-6">
              <div className="aspect-[16/10] rounded-lg bg-slate-800/60" />
              <div className="mt-4 h-6 w-3/4 rounded bg-slate-800/80" />
              <div className="mt-3 h-16 w-full rounded bg-slate-800/50" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === "split") {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-16 md:py-24">
        <div className="max-w-3xl space-y-3">
          <div className="h-4 w-28 rounded bg-slate-800/80" />
          <div className="h-10 w-64 rounded-lg bg-slate-800/80" />
          <div className="h-20 w-full max-w-xl rounded-lg bg-slate-800/60" />
        </div>
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="h-6 w-40 rounded bg-slate-800/80" />
            <div className="h-24 w-full rounded-lg bg-slate-800/50" />
            <div className="h-24 w-full rounded-lg bg-slate-800/50" />
          </div>
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/20 p-8 lg:col-span-7">
            <div className="h-8 w-48 rounded bg-slate-800/80" />
            <div className="mt-8 space-y-4">
              <div className="h-10 w-full rounded-lg bg-slate-800/60" />
              <div className="h-10 w-full rounded-lg bg-slate-800/60" />
              <div className="h-28 w-full rounded-lg bg-slate-800/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-16 md:py-24">
      <div className="max-w-3xl space-y-3">
        <div className="h-4 w-28 rounded bg-slate-800/80" />
        <div className="h-10 max-w-xs rounded-lg bg-slate-800/80" />
        <div className="h-20 max-w-xl rounded-lg bg-slate-800/60" />
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className="rounded-xl border border-slate-800/50 bg-slate-900/20 p-6">
            <div className="h-6 w-2/3 rounded bg-slate-800/80" />
            <div className="mt-4 h-24 w-full rounded bg-slate-800/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
