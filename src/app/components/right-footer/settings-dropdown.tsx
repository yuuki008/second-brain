"use client";

import { useZen } from "@/components/providers/zen-provider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { Info, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SettingsDropdown() {
  const { isZenMode, setZenMode } = useZen();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
          title="設定"
        >
          設定
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] p-0">
        <div className="bg-muted text-muted-foreground px-4 py-3 border-b text-sm flex items-center justify-between">
          サイトの設定
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="px-4 py-3 space-y-2">
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
                    執筆や閲読にのみ集中するモードです。オンにすると「ビュー数」「リアクション」などの情報が消え、余計な要素に惑わされることなくコンテンツそのものに没頭できます。
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
