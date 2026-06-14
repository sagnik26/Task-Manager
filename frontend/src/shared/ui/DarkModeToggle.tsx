import { Moon, Sun } from "lucide-react";

import { useDarkMode } from "../theme/useDarkMode";

export function DarkModeToggle({
  className = "icon-btn",
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  const { darkMode, toggle } = useDarkMode();

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
