"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Term } from "@prisma/client";

interface TagDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTerm:
    | (Term & { tags: { id: string; name: string; color: string }[] })
    | null;
}

const TagDetail: React.FC<TagDetailProps> = ({
  open,
  onOpenChange,
  selectedTerm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedTerm?.name}
          </DialogTitle>
          {selectedTerm?.tags && selectedTerm.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedTerm.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: selectedTerm?.definition || "",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TagDetail;
