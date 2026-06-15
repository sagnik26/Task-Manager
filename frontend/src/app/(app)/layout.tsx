"use client";

import { ProtectedRoute } from "@/shared/layouts/ProtectedRoute";
import { AppShell } from "@/shared/layouts/AppShell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
