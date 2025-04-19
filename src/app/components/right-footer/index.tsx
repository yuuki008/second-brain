"use client";

import { useZen } from "@/components/providers/zen-provider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info, LogIn, LogOut, Search, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CmdKSearchModal from "./cmd-k-search-modal";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { LoginDialog } from "./login-dialog";
import { Button } from "@/components/ui/button";

export default function RightFooter() {
  const { isZenMode, setZenMode } = useZen();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

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
      <DropdownMenu>
        <DropdownMenuTrigger className="fixed bottom-4 right-4" asChild>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
            title="サイトの設定"
          >
            サイトの設定
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px] p-0">
          <div className="bg-muted text-muted-foreground mb-3 px-4 py-3 border-b text-sm flex items-center justify-between">
            サイトの設定
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex justify-end px-3">
            <button
              className="flex items-center justify-between text-xs font-light p-2 bg-muted text-muted-foreground rounded-md w-full"
              onClick={() => setIsCmdKOpen(true)}
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-1" />
                ページを検索...
              </div>
              <div className="ml-4 hidden md:inline-block">
                <kbd className="rounded-md px-1.5 py-0.5 text-xs font-medium">
                  ⌘ K
                </kbd>
              </div>
            </button>
          </div>

          <div className="px-3 py-3 space-y-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <div className="text-sm shrink-0 font-light">テーマ</div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="テーマ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">ライト</SelectItem>
                    <SelectItem value="dark">ダーク</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between h-10">
              <div className="text-sm shrink-0 font-light flex items-center">
                禅モード
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      執筆や閲読にのみ集中するモードです。オンにすると「ビュー数」「リアクション」などの情報が消え、コンテンツそのものに没頭できます。
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={isZenMode}
                onCheckedChange={setZenMode}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
              />
            </div>

            <DropdownMenuSeparator />

            {isAuthenticated ? (
              <div className="flex items-center justify-between h-10">
                <div className="text-sm shrink-0 font-light">ログアウト</div>
                <Button
                  className="text-sm font-light"
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between h-10">
                <div className="text-sm shrink-0 font-light">ログイン</div>

                <Button
                  className="text-sm font-light"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLoginDialogOpen(true)}
                >
                  <LogIn className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
