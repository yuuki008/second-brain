import { HintModal } from "./hint-modal";

export default function HelpMenu() {
  return (
    <div className="fixed bottom-2 left-2 z-50">
      <div className="flex flex-col gap-2">
        <HintModal />
      </div>
    </div>
  );
}
