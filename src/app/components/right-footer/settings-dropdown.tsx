"use client";

import { useZen } from "@/hooks/use-zen";
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
      <DropdownMenuContent align="end" className="w-[250px] p-4 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm shrink-0">テーマ</div>
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

        <div className="flex items-center justify-between">
          <div className="text-sm shrink-0">Zenモード</div>
          <Switch
            checked={isZenMode}
            onCheckedChange={setZenMode}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
