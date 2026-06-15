import { createContext, useContext } from "react";

export type AppShellContext = {
  openNewProject: () => void;
};

export const AppShellContext = createContext<AppShellContext | null>(null);

export function useAppShellContext(): AppShellContext {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShellContext must be used within AppShell");
  }
  return context;
}
