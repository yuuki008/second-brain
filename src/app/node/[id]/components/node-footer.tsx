import { Separator } from "@/components/ui/separator";
import HintModal from "./hint-modal";

export default function NodeFooter() {
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <div className="flex gap-2 items-center">
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light">
          設定
        </button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <HintModal />
      </div>
    </div>
  );
}
