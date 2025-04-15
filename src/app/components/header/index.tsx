"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginDialog } from "./login-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";
import CmdKSearchModal from "./cmd-k-search-modal";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CmdKSearchModal open={open} setOpen={setOpen} />
      <div className="fixed top-0 left-0 pl-5 z-[30] bg-transparent w-full">
        <div className="flex justify-between items-start h-full pr-5 py-4">
          <Link className="cursor-pointer" href="/">
            <Image
              src={theme === "dark" ? "/dark-sign.png" : "/light-sign.png"}
              alt="logo"
              width={35}
              height={35}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center">
            <div className="ml-4" />
            <Button
              variant="outline"
              className={cn(
                "relative h-8 justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 w-40"
              )}
              onClick={() => setOpen(true)}
            >
              Search...
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
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
    </>
  );
}
