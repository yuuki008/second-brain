"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, LogOut } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "./login-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";
import Search from "../search";

export default function Header() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 pl-5 z-[30] bg-transparent w-full">
      <div className="flex justify-between items-start h-full pr-5 py-4">
        <Link className="cursor-pointer" href="/">
          <Image
            src={theme === "dark" ? "/dark-sign.png" : "/light-sign.png"}
            alt="logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center">
          <Search />
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="ログアウト"
              className="rounded-full h-10 w-10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
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
