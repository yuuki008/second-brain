import { Separator } from "@/components/ui/separator";

import HintModal from "./hint-modal";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function NodeFooter() {
  return (
    <div className="fixed bottom-2 left-2 z-50 hidden md:block">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-xs font-light px-2">
          <Settings />
          設定
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <HintModal />
      </div>
    </div>
  );
}
