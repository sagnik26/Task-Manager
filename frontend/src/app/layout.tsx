import type { Metadata } from "next";

import { Providers } from "@/shared/providers/Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
