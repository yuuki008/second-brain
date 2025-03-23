"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // 現在のテーマの状態
  const [isDarkMode, setIsDarkMode] = useState(false);

  // テーマの切り替え関数
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // HTML要素のクラスを更新
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // カスタムイベントを発火してグラフなどに通知
    const themeChangeEvent = new CustomEvent("themeChange", {
      detail: { isDarkMode: newMode },
    });
    window.dispatchEvent(themeChangeEvent);
  };

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={toggleTheme}
      className="rounded-full h-10 w-10 relative"
      aria-label={
        isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"
      }
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
