"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Ctx = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const MobileNavContext = createContext<Ctx | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => setOpen(true), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(
    () => ({ open, openMenu, closeMenu, toggleMenu }),
    [open, openMenu, closeMenu, toggleMenu],
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav requires MobileNavProvider");
  return ctx;
}
