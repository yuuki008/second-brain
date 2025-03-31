"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, LogOut } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "./login-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 pl-5 z-[30] bg-transparent w-full">
      <div className="flex items-center justify-between h-full py-4 pr-5">
        <Link className="cursor-pointer" href="/">
          <Image
            src="/panic-brain.png"
            alt="logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              title="ログアウト"
              className="rounded-full h-10 w-10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-full h-10 w-10"
              size="icon"
              onClick={() => setIsLoginDialogOpen(true)}
              title="管理者ログイン"
            >
              <Lock className="h-5 w-5" />
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />
    </div>
  );
}
