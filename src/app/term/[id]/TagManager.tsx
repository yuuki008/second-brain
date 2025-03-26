"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { addTagToNode, removeTagFromNode } from "./actions";
import { Tag } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
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

  const handleTagToggle = async (tagId: string, isSelected: boolean) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              タグの追加
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
