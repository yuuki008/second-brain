import { Separator } from "@/components/ui/separator";
import { Node, Tag } from "@prisma/client";
import DeleteNodeDialog from "./delete-node-dialog";
import SwitchVisibility from "./switch-visibility";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { useState } from "react";

interface NodeFooterProps {
  node: Node & { tags: Tag[] };
}

export default function NodeFooter({ node }: NodeFooterProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 left-4 z-50"
          >
            {isSheetOpen ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
            <span className="sr-only">設定を開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full sm:w-[800px] p-0 flex flex-col"
        >
          <SheetHeader className="p-4 border-b">
            <SheetTitle>ノード設定</SheetTitle>
            <SheetDescription>
              ノードの表示設定、タグ、削除などを行います。
            </SheetDescription>
          </SheetHeader>

          <div className="flex-grow p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                公開設定
              </h3>
              <SwitchVisibility node={node} />
            </div>

            <Separator />

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                ノードの操作
              </h3>
              <DeleteNodeDialog node={node} />
            </div>
          </div>

          <SheetFooter className="p-4 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
              className="w-full"
            >
              閉じる
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
