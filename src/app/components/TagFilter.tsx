"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TagFilterComponentProps {
  allTags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterComponentProps> = ({
  allTags,
  activeTag,
  onTagSelect,
}) => {
  const [showTagList, setShowTagList] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10">
      <Popover open={showTagList} onOpenChange={setShowTagList}>
        <PopoverTrigger asChild>
          <Button
            variant={activeTag ? "default" : "outline"}
            size="icon"
            className="rounded-full h-10 w-10 relative"
          >
            <Tag className="h-5 w-5" />
            {activeTag && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <ScrollArea className="max-h-64">
            <div className="p-4 flex flex-wrap gap-2">
              {allTags.map((tag: string) => (
                <Badge
                  key={tag}
                  onClick={() => onTagSelect(tag)}
                  variant={activeTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagFilter;
