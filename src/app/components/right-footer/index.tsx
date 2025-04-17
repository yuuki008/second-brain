"use client";

import CmdKSearchModal from "./cmd-k-search-modal";
import { LoginDialog } from "./login-dialog";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import SettingsDropdown from "./settings-dropdown";
import { useAuth } from "@/components/providers/auth-provider";

export default function RightFooter() {
  const { isAuthenticated, logout } = useAuth();
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdKOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CmdKSearchModal open={isCmdKOpen} setOpen={setIsCmdKOpen} />
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />

      <div className="fixed bottom-4 right-4">
        <div className="flex gap-2 items-center">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
            onClick={() => setIsCmdKOpen(true)}
          >
            検索
          </button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          {isAuthenticated ? (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
              onClick={logout}
              title="ログアウト"
            >
              ログアウト
            </button>
          ) : (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
              onClick={() => setIsLoginDialogOpen(true)}
              title="管理者ログイン"
            >
              ログイン
            </button>
          )}
          <Separator orientation="vertical" className="h-4 mx-1" />
          <SettingsDropdown />
        </div>
      </div>
    </>
  );
}
