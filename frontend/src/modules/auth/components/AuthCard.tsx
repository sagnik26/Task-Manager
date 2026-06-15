import type { ReactNode } from "react";

import { Logo } from "@/shared/ui/Logo";

export function AuthCard({
  title,
  subtitle,
  subtitleStyle,
  children,
}: {
  title: string;
  subtitle: string;
  subtitleStyle?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="auth-card">
      <div className="auth-card__logo">
        <Logo />
      </div>
      <h2 className="auth-card__title">{title}</h2>
      <p className="auth-card__subtitle" style={subtitleStyle}>
        {subtitle}
      </p>
      {children}
    </div>
  );
}
