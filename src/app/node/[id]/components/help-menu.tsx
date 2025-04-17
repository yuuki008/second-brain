import HintModal from "./hint-modal";
import TagsMenu from "./tags-menu";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@prisma/client";
import { deleteNode } from "@/app/actions/node";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HelpMenuProps {
  nodeId: string;
  currentTags: Tag[];
  allTags: Tag[];
}

export default function HelpMenu({
  nodeId,
  currentTags,
  allTags,
}: HelpMenuProps) {
  const router = useRouter();

  const onClickDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteNode(nodeId);
      toast.success("ノードを削除しました");
      router.push("/");
    } catch {
      toast.error("ノードを削除できませんでした");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <div className="flex gap-2 items-center">
        <button
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
          onClick={onClickDelete}
        >
          削除
        </button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <TagsMenu allTags={allTags} nodeId={nodeId} currentTags={currentTags} />
        <Separator orientation="vertical" className="h-4 mx-1" />
        <HintModal />
      </div>
    </div>
  );
}
