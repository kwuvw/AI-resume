"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </button>
  );
}
