import { create } from "zustand";
import { persist } from "zustand/middleware";

type DarkModeState = {
  darkMode: boolean;
  toggle: () => void;
  setDarkMode: (value: boolean) => void;
};

export const useDarkMode = create<DarkModeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggle: () => set((s) => ({ darkMode: !s.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
    }),
    { name: "taskmanager-dark-mode", skipHydration: true },
  ),
);
