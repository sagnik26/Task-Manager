import type { ReactNode } from "react";

import { DarkModeToggle } from "@/shared/ui/DarkModeToggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--tr" />
      <div className="auth-blob auth-blob--bl" />
      <DarkModeToggle className="icon-btn icon-btn--auth" />
      {children}
    </div>
  );
}
