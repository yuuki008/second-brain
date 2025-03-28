"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="bottom-0 right-0 fixed z-10 flex w-full justify-end items-center">
      <div className="max-w-screen-md flex flex-wrap gap-2 p-4 bg-background/70 backdrop-blur-sm rounded-lg">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            variant={selectedTagIds.includes(tag.id) ? "default" : "secondary"}
            className="cursor-pointer p-2 hover:opacity-80 transition-opacity"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
