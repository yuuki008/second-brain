"use client";

import React, { useState } from "react";
import { ChevronRight, Tag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// 階層構造を持つタグの型定義
export interface HierarchicalTag {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  children?: HierarchicalTag[];
}

interface TagFilterComponentProps {
  tags: HierarchicalTag[];
  activeTagId: string | null;
  onTagSelect: (tagId: string) => void;
}

const TagNode: React.FC<{
  tag: HierarchicalTag;
  activeTagId: string | null;
  onTagSelect: (tagId: string) => void;
  level: number;
}> = ({ tag, activeTagId, onTagSelect, level }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = tag.children && tag.children.length > 0;

  return (
    <div className="w-full">
      <div
        className={`flex items-center py-1 px-1 rounded-md hover:bg-gray-100 ${
          activeTagId === tag.id ? "bg-gray-100" : ""
        }`}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 mr-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6"></div>
        )}
        <Badge
          onClick={() => onTagSelect(tag.id)}
          variant={activeTagId === tag.id ? "default" : "secondary"}
          className="cursor-pointer"
          style={{
            backgroundColor: activeTagId === tag.id ? tag.color : undefined,
          }}
        >
          {tag.name}
        </Badge>
      </div>

      {hasChildren && expanded && (
        <div className="pl-2">
          {tag.children!.map((child) => (
            <TagNode
              key={child.id}
              tag={child}
              activeTagId={activeTagId}
              onTagSelect={onTagSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TagFilter: React.FC<TagFilterComponentProps> = ({
  tags,
  activeTagId,
  onTagSelect,
}) => {
  const [showTagList, setShowTagList] = useState(false);

  // トップレベルのタグのみをフィルタリング
  const rootTags = tags.filter((tag) => tag.parentId === null);

  return (
    <div className="absolute top-4 left-4 z-10">
      <Popover open={showTagList} onOpenChange={setShowTagList}>
        <PopoverTrigger asChild>
          <Button
            variant={activeTagId ? "default" : "outline"}
            size="icon"
            className="rounded-full h-10 w-10 relative"
          >
            <Tag className="h-5 w-5" />
            {activeTagId && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <ScrollArea className="max-h-80">
            <div className="space-y-1">
              {rootTags.map((tag) => (
                <TagNode
                  key={tag.id}
                  tag={tag}
                  activeTagId={activeTagId}
                  onTagSelect={onTagSelect}
                  level={0}
                />
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagFilter;
