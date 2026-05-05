"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type BrandLogoPreset = "header" | "footer" | "login" | "admin";

const LOGO_SRC = "/brand/logo.png";
/** Layout box for `next/image`; asset is ~horizontal (≈2:1). */
const INTRINSIC_W = 640;
const INTRINSIC_H = 320;

const PRESET_CLASS: Record<BrandLogoPreset, string> = {
  /** ~110–130px wide; height follows aspect ratio */
  header: "h-auto w-[min(128px,calc(100vw-5rem))] min-w-0",
  footer: "h-auto max-h-8 w-auto max-w-[170px] sm:max-h-9 sm:max-w-[190px]",
  login: "h-auto w-[min(140px,90vw)]",
  admin: "h-auto w-[120px]"
};

const SIZES: Record<BrandLogoPreset, string> = {
  header: "(max-width: 640px) 120px, 130px",
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
      src={LOGO_SRC}
      alt="Arrow Bilişim"
      width={INTRINSIC_W}
      height={INTRINSIC_H}
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
