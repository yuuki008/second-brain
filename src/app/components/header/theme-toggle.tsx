"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={
        theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"
      }
    >
      {theme === "dark" ? "暗" : "明"}
    </button>
  );
}
