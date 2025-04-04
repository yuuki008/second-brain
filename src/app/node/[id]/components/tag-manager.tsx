"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { addTagToNode, createTag, removeTagFromNode } from "../actions";
import { Tag } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, PlusCircle } from "lucide-react";
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

interface TagManagerProps {
  nodeId: string;
  currentTags: Tag[];
  allTags: Tag[];
}

const TagManager: React.FC<TagManagerProps> = ({
  nodeId,
  currentTags,
  allTags,
}) => {
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

  // 検索に基づいてタグをフィルタリング
  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

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

  // 認証されていない場合は読み取り専用の表示
  if (!isAuthenticated) {
    return (
      <div className="w-full mb-4">
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-sm relative border"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="タグを検索..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>タグが見つかりません</CommandEmpty>
              <CommandList>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {filteredTags.map((tag) => {
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
                      <div className="">
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

        {currentTags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-sm relative">
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagManager;
