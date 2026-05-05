"use client";

import { useState } from "react";

type FormStatus = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const busy = status === "submitting";
  const sent = status === "sent";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 550));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
      {status === "error" ? (
        <p className="rounded-lg border border-red-800/70 bg-red-950/35 px-4 py-3 text-sm text-red-200" role="alert">
          Gönderim sırasında bir sorun oluştu. Biraz sonra yeniden deneyin veya doğrudan e-posta ile ulaşın.
        </p>
      ) : null}
      {sent ? (
        <p className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          Mesajınız alındı. En kısa sürede sizinle iletişime geçeceğiz. (Demo: form henüz sunucuya bağlı değil.)
        </p>
      ) : null}
      <div>
        <label htmlFor="contact-name" className="text-xs font-medium text-slate-400">
          Ad Soyad
        </label>
        <input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          disabled={sent || busy}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-corporate-accent focus:outline-none focus:ring-1 focus:ring-corporate-accent disabled:opacity-50"
          placeholder="Örn. Ayşe Yılmaz"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className="text-xs font-medium text-slate-400">
            E-posta
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={sent || busy}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-corporate-accent focus:outline-none focus:ring-1 focus:ring-corporate-accent disabled:opacity-50"
            placeholder="ornek@firma.com"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="text-xs font-medium text-slate-400">
            Telefon
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            disabled={sent || busy}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-corporate-accent focus:outline-none focus:ring-1 focus:ring-corporate-accent disabled:opacity-50"
            placeholder="+90 (212) 000 00 00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="text-xs font-medium text-slate-400">
          Konu
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          disabled={sent || busy}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-corporate-accent focus:outline-none focus:ring-1 focus:ring-corporate-accent disabled:opacity-50"
          placeholder="Örn. Restoran otomasyonu teklifi"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-medium text-slate-400">
          Mesajınız
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          disabled={sent || busy}
          className="mt-1.5 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-corporate-accent focus:outline-none focus:ring-1 focus:ring-corporate-accent disabled:opacity-50"
          placeholder="Kısa proje özeti veya sorunuzu yazın."
        />
      </div>

      <button
        type="submit"
        disabled={sent || busy}
        className="rounded-lg bg-corporate-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-corporate-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Gönderiliyor…" : sent ? "Gönderildi" : "Gönder"}
      </button>
    </form>
  );
}
