/** Inline mark — no image asset in repo; reads as Arrow Bilişim companion glyph. */
export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg border border-corporate-accent/35 bg-corporate-accent/10 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%] text-corporate-accent">
        <path d="M4 12h12l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 17l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  );
}
