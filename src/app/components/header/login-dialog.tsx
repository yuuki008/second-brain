"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function LoginDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  // エスケープキーでモーダルを閉じる
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // オーバーレイクリックでモーダルを閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password.trim()) {
      setError("パスワードを入力してください");
      return;
    }

    try {
      const success = await login(password);
      if (success) {
        setPassword("");
        setError("");
        onClose();
      } else {
        setError("パスワードが正しくありません");
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      setError("ログイン処理中にエラーが発生しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "rounded-lg shadow-lg w-[90%] max-w-xs bg-background backdrop-blur-lg transform transition-all duration-300 overflow-hidden px-10 py-6"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {/* 画像部分 */}
          <div className="w-full flex justify-center">
            <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden">
              <Image
                src="/password-checking-brain.png"
                alt="password-checking-brain"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* フォーム部分 */}
          <div className="w-full pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="w-full text-center"
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
