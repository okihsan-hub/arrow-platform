"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type BrandLogoPreset = "header" | "footer" | "login" | "admin";

/** Processed web assets: full wordmark + icon-only mark (no text). */
const ASSET: Record<BrandLogoPreset, { src: string; w: number; h: number }> = {
  header: { src: "/logo.png", w: 1000, h: 797 },
  footer: { src: "/logo.png", w: 1000, h: 797 },
  login: { src: "/logo.png", w: 1000, h: 797 },
  admin: { src: "/logo-icon.png", w: 532, h: 797 }
};

const PRESET_CLASS: Record<BrandLogoPreset, string> = {
  /** Mobile 120px · md 160px · lg 180px; minimal shadow for dark header */
  header:
    "h-auto min-w-0 w-[min(120px,calc(100vw-5rem))] md:w-[160px] lg:w-[180px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
  footer: "h-auto max-h-8 w-auto max-w-[170px] sm:max-h-9 sm:max-w-[190px]",
  login: "h-auto w-[min(140px,90vw)]",
  admin: "h-auto w-[120px]"
};

const SIZES: Record<BrandLogoPreset, string> = {
  header: "(max-width: 767px) 120px, (max-width: 1023px) 160px, 180px",
  footer: "(max-width: 768px) 140px, 180px",
  login: "140px",
  admin: "120px"
};

type BrandLogoProps = {
  preset: BrandLogoPreset;
  /** Wrap logo in `Link` (e.g. home). */
  href?: string;
  className?: string;
  /** LCP-critical surfaces (marketing header / login). */
  priority?: boolean;
};

/** Full ARROW BİLİŞİM mark — `object-contain`, no stretching; text fallback if the asset fails. */
export function BrandLogo({ preset, href, className = "", priority }: BrandLogoProps) {
  const [broken, setBroken] = useState(false);
  const align = preset === "login" ? "object-center" : "object-left";
  const { src, w: iw, h: ih } = ASSET[preset];

  const content = broken ? (
    <span
      className={`font-semibold tracking-tight text-white ${
        preset === "login" ? "text-center text-lg" : preset === "admin" ? "text-xs" : "text-sm"
      }`}
    >
      Arrow Bilişim
    </span>
  ) : (
    <Image
      src={src}
      alt="Arrow Bilişim"
      width={iw}
      height={ih}
      priority={priority ?? false}
      quality={90}
      sizes={SIZES[preset]}
      className={`block object-contain ${align} ${PRESET_CLASS[preset]} ${className}`}
      onError={() => setBroken(true)}
    />
  );

  const wrapClass =
    preset === "login"
      ? "inline-flex shrink-0 items-center justify-center"
      : "inline-flex shrink-0 items-center";

  if (href) {
    return (
      <Link href={href} className={wrapClass}>
        {content}
      </Link>
    );
  }

  return <span className={wrapClass}>{content}</span>;
}
