"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2, Tag as TagIcon, Lightbulb } from "lucide-react";
import TagsMenu from "./tags-menu";
import HintModal from "./hint-modal";
import { Tag } from "@prisma/client";
import { deleteNode } from "@/app/actions/node";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PageSettingsDropdownProps {
  nodeId: string;
  currentTags: Tag[];
  allTags: Tag[];
}

export function PageSettingsDropdown({
  nodeId,
  currentTags,
  allTags,
}: PageSettingsDropdownProps) {
  const router = useRouter();

  const onClickDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteNode(nodeId);
      toast.success("ノードを削除しました");
      router.push("/");
    } catch {
      toast.error("ノードを削除できませんでした");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="ページの設定"
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
        >
          ページの設定
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-0">
        <DropdownMenuLabel className="flex items-center border-b font-normal justify-between bg-muted text-muted-foreground px-4 py-3">
          ページの設定
          <Settings className="w-4 h-4" />
        </DropdownMenuLabel>

        <div className="p-3 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <TagIcon className="w-4 h-4 mr-2 text-muted-foreground" />
            タグを編集
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <TagsMenu
              allTags={allTags}
              nodeId={nodeId}
              currentTags={currentTags}
            />
          </div>
        </div>

        <div className="p-3 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" />
            執筆のヒント
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <HintModal />
          </div>
        </div>

        <DropdownMenuItem
          className="text-destructive px-2 py-3 focus:text-destructive focus:bg-destructive/10 flex items-center justify-between"
          onClick={(e) => {
            e.preventDefault();
            onClickDelete();
          }}
        >
          <div className="flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            このページを削除
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
