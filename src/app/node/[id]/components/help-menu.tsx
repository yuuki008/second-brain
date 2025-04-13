import HintModal from "./hint-modal";
import TagsMenu from "./tags-menu";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@prisma/client";

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
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <div className="flex gap-2 items-center">
        <HintModal />
        <Separator orientation="vertical" className="h-4 mx-1" />
        <TagsMenu allTags={allTags} nodeId={nodeId} currentTags={currentTags} />
      </div>
    </div>
  );
}
