/** Non-navigating placeholder until a real wa.me link is configured. */
export function WhatsAppPlaceholder() {
  return (
    <span
      className="inline-flex cursor-default items-center gap-2 rounded-lg border border-emerald-800/70 bg-emerald-950/30 px-4 py-2.5 text-sm font-semibold text-emerald-200/90"
      title="WhatsApp bağlantısı yakında eklenecek"
    >
      <span className="text-lg leading-none" aria-hidden>
        ◆
      </span>
      WhatsApp (yakında)
    </span>
  );
}
