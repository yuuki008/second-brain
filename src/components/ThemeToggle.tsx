"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // 現在のテーマの状態
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 初期化時にドキュメントのクラスからダークモードかを判定
  useEffect(() => {
    document.documentElement.classList.add("dark");
    setIsDarkMode(true);
  }, []);

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
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"
      }
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
