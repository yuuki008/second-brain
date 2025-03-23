"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HierarchicalTag } from "./TagFilter";

interface TagCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: HierarchicalTag[];
}

const TagCreate: React.FC<TagCreateProps> = ({ open, onOpenChange, tags }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>新規用語の作成</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              用語名
            </label>
            <Input placeholder="用語名を入力" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              タグ
            </label>
            <div className="border rounded-md p-2 max-h-48 overflow-y-auto dark:border-gray-700">
              {tags.map((rootTag) => (
                <div key={rootTag.id} className="mb-2">
                  <div className="font-medium mb-1">{rootTag.name}</div>
                  <div className="pl-4 space-y-1">
                    {rootTag.children?.map((childTag) => (
                      <div key={childTag.id}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded dark:bg-gray-800"
                          />
                          <span>{childTag.name}</span>
                        </label>
                        {childTag.children && childTag.children.length > 0 && (
                          <div className="pl-6 space-y-1 mt-1">
                            {childTag.children.map((grandchildTag) => (
                              <label
                                key={grandchildTag.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  className="rounded dark:bg-gray-800"
                                />
                                <span>{grandchildTag.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              定義/説明
            </label>
            <Textarea
              className="h-32"
              placeholder="マークダウン形式で入力できます..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagCreate;
