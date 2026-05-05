"use client";

import Image from "next/image";

/**
 * Text-free mark (`/logo-icon.png`). Regenerate with `npm run logo:transparent` if art changes;
 * then update `INTRINSIC` to match `sharp` metadata for that file.
 */
const INTRINSIC = { w: 532, h: 797 } as const;
const SRC = "/logo-icon.png";

type LogoIconProps = {
  className?: string;
  /** Pass-through to `next/image` for LCP (e.g. mobile header). */
  priority?: boolean;
};

/** Simplified icon-only logo (no wordmark) — `object-contain`, do not stretch. */
export function LogoIcon({ className = "", priority }: LogoIconProps) {
  return (
    <Image
      src={SRC}
      alt="Arrow Bilişim"
      width={INTRINSIC.w}
      height={INTRINSIC.h}
      className={`block object-contain ${className}`}
      priority={priority ?? false}
      sizes="120px"
    />
  );
}
