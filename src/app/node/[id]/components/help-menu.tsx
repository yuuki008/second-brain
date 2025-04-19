import { Tag } from "@prisma/client";
import { PageSettingsDropdown } from "./page-settings-dropdown";

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
        <PageSettingsDropdown
          nodeId={nodeId}
          currentTags={currentTags}
          allTags={allTags}
        />
      </div>
    </div>
  );
}
