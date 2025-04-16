"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Check, Tag } from "lucide-react";

export interface HierarchicalTag {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  children?: HierarchicalTag[];
}

interface TagFilterComponentProps {
  tags: HierarchicalTag[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

const TagFilter: React.FC<TagFilterComponentProps> = ({
  tags,
  selectedTagIds,
  onTagToggle,
}) => {
  const [search, setSearch] = useState("");

  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedTagIds.includes(tag.id)),
    [tags, selectedTagIds]
  );

  const unselectedTags = useMemo(
    () => tags.filter((tag) => !selectedTagIds.includes(tag.id)),
    [tags, selectedTagIds]
  );

  const filteredUnselectedTags = useMemo(() => {
    if (!search) return unselectedTags;
    return unselectedTags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [unselectedTags, search]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-20"
        >
          <Tag className="h-4 w-4" />
          <span className="sr-only">タグフィルターを開く</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-none p-0">
        <Command className="absolute top-full right-0 mt-2 w-72 h-auto max-h-[300px] rounded-lg border shadow-md z-50 bg-popover text-popover-foreground">
          <CommandInput
            placeholder="タグを検索..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>タグが見つかりません。</CommandEmpty>
            {selectedTags.length > 0 && (
              <CommandGroup heading="選択中">
                {selectedTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      onTagToggle(tag.id);
                      // 必要であればダイアログを閉じるロジックを追加
                      // setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {selectedTags.length > 0 && filteredUnselectedTags.length > 0 && (
              <CommandSeparator />
            )}
            {filteredUnselectedTags.length > 0 && (
              <CommandGroup heading="選択可能">
                {filteredUnselectedTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      onTagToggle(tag.id);
                      // 必要であればダイアログを閉じるロジックを追加
                      // setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 h-4 w-4" />{" "}
                    {/* チェックマークのスペース用 */}
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagFilter;
