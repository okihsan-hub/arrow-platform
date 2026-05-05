import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://www.arrowbilisim.com";

/** Site origin for canonical URLs and Open Graph; override with NEXT_PUBLIC_SITE_URL in deployment. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return DEFAULT_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type PageSeoOptions = {
  /** Page title (template in root layout adds " | Arrow Bilişim" when nested). */
  title: string;
  description: string;
  /** Path including leading slash (e.g. `/services`). */
  path: string;
  keywords?: string[];
  robots?: Metadata["robots"];
};

/**
 * Opinionated Metadata for marketing pages — Open Graph, Twitter card, canonical, robots.
 */
export function buildPageMetadata(opts: PageSeoOptions): Metadata {
  const url = absoluteUrl(opts.path);
  const fullTitle = `${opts.title} | Arrow Bilişim`;

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url,
      siteName: "Arrow Bilişim",
      locale: "tr_TR",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description
    },
    alternates: {
      canonical: url
    },
    robots: opts.robots ?? { index: true, follow: true }
  };
}
