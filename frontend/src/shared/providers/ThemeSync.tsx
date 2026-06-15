"use client";

import { useLayoutEffect, type ReactNode } from "react";

import { useDarkMode } from "../theme/useDarkMode";

export function ThemeSync({ children }: { children: ReactNode }) {
  const darkMode = useDarkMode((s) => s.darkMode);

  useLayoutEffect(() => {
    useDarkMode.persist.rehydrate();
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return <>{children}</>;
}
