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
import { Lock } from "lucide-react";

export function LoginDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = () => {
    const success = login(password);
    if (success) {
      setPassword("");
      setError("");
      onClose();
    } else {
      setError("パスワードが正しくありません");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <Lock className="h-10 w-10" />
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <form onSubmit={handleLogin}>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="col-span-3"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
