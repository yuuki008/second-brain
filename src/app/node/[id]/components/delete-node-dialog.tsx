import { deleteNode } from "@/app/actions/node";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Node } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteNodeDialogProps {
  node: Node;
}

export default function DeleteNodeDialog({ node }: DeleteNodeDialogProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDeleteNode() {
    setIsSubmitting(true);
    try {
      await deleteNode(node.id);
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  }

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs font-light px-2">
          <Trash2 className="h-4 w-4" />
          削除する
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>本当に「{node.name}」を削除しますか？</DialogTitle>
          <DialogDescription>
            この操作は取り消すことができません。「{node.name}
            」に関連するすべてのデータが完全に削除されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteNode}
            disabled={isSubmitting}
          >
            {isSubmitting ? "削除中..." : "削除する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
