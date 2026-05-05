/** Ülke kodu + hat: TR için genelde 12 rakam (örn. 905551234567) — '+' yok */
const PLACEHOLDER_WA_DIGITS = "905000000000";

/**
 * `NEXT_PUBLIC_WHATSAPP_ME_URL` varsa doğrudan kullanılır (örn. `https://wa.me/905551234567`).
 * Yoksa `NEXT_PUBLIC_WHATSAPP_PHONE` rakamlarından `https://wa.me/<rakamlar>` üretilir.
 */
export function getWhatsAppChatUrl(): string {
  const full = process.env.NEXT_PUBLIC_WHATSAPP_ME_URL?.trim();
  if (full?.startsWith("http")) return full;

  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() ?? PLACEHOLDER_WA_DIGITS;
  const digits = raw.replace(/\D/g, "");
  const e164 =
    digits.length >= 10 && digits.length <= 15 ? digits : PLACEHOLDER_WA_DIGITS.replace(/\D/g, "");
  return `https://wa.me/${e164}`;
}
