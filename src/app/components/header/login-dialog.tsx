"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] w-[90%] gap-0">
        <DialogHeader>
          <DialogTitle>
            <Image
              src="/password-checking-brain.png"
              alt="password-checking-brain"
              width={300}
              height={300}
              className="mx-auto"
            />
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-4">
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
