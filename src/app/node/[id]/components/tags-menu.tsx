"use client";

import React, { useState, useMemo } from "react";
import { addTagToNode, createTag, removeTagFromNode } from "../actions";
import { Tag } from "@prisma/client";
import { Check, PlusCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

interface TagsMenuProps {
  nodeId: string;
  currentTags: Tag[];
  allTags: Tag[];
}

export default function TagsMenu({
  nodeId,
  currentTags,
  allTags,
}: TagsMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();

  const handleTagToggle = async (tagId: string, isSelected: boolean) => {
    if (!isAuthenticated) return;

    try {
      if (isSelected) {
        await addTagToNode(nodeId, tagId);
      } else {
        await removeTagFromNode(nodeId, tagId);
      }
    } catch (error) {
      console.error("タグの更新に失敗しました:", error);
    }
  };

  const handleCreateTag = async (tagName: string) => {
    if (!isAuthenticated) return;

    try {
      const tag = await createTag(tagName);
      await addTagToNode(nodeId, tag.id);
      setSearch("");
    } catch (error) {
      console.error("タグの作成に失敗しました:", error);
    }
  };

  // フィルタリングと並べ替えを一つのuseMemoにまとめる
  const sortedTags = useMemo(() => {
    return allTags
      .filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aSelected = currentTags.some((t) => t.id === a.id);
        const bSelected = currentTags.some((t) => t.id === b.id);
        return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
      });
  }, [allTags, currentTags, search]);

  if (!isAuthenticated) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light">
          タグ
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[120]" align="start">
        <Command>
          <CommandInput
            placeholder="タグを検索..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>タグが見つかりません</CommandEmpty>
          <CommandList>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {sortedTags.map((tag) => {
                const isSelected = currentTags.some((t) => t.id === tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleTagToggle(tag.id, !isSelected)}
                    className="flex items-center justify-between"
                  >
                    {tag.name}
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
              {search.length > 0 && (
                <CommandItem
                  onSelect={() => handleCreateTag(search)}
                  className="cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 mr-3" />
                  <div>
                    Create
                    <span className="text-accent ml-2">{search}</span>
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
