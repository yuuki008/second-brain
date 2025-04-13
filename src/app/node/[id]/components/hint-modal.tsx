import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { memo, useState, useEffect, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

const ShortcutKeyItem = memo(
  ({ keys, description }: { keys: string[]; description: string }) => {
    return (
      <div className="flex space-x-2 justify-between items-center py-[2px]">
        <span className="text-sm">{description}</span>
        <div className="flex items-center">
          {keys.map((key) => (
            <div className="flex items-center" key={key}>
              <kbd className="text-xs rounded-md leading-4 border px-1 bg-muted font-mono">
                {key}
              </kbd>
              {key !== keys[keys.length - 1] && (
                <span className="mx-1 text-xs">+</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ShortcutKeyItem.displayName = "ShortcutKeyItem";

const HintModal = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // キーボードショートカットの設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setVisible(!visible);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  return (
    <>
      <button
        className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer items-center text-xs font-light"
        onClick={() => setVisible(!visible)}
      >
        執筆のヒント
      </button>

      {visible && (
        <Draggable
          nodeRef={nodeRef}
          handle=".draggable-handle"
          position={position}
          onStop={(e: DraggableEvent, data: DraggableData) =>
            setPosition({ x: data.x, y: data.y })
          }
          bounds="body"
        >
          <div
            ref={nodeRef}
            className="fixed top-20 left-4 z-50 bg-background border rounded-lg shadow-lg overflow-hidden w-[400px] max-h-[635px]"
            style={{ resize: "both" }}
          >
            <div className="flex flex-col h-full max-h-[635px]">
              <div className="cursor-move draggable-handle flex justify-between items-center bg-muted p-2 border-b">
                <div className="flex items-center">
                  <GripVertical className="w-4 h-4" />
                  <span className="ml-2 font-bold">執筆のヒント</span>
                </div>

                <Button
                  onClick={() => setVisible(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                <div>
                  <h3 className="font-medium mb-2">基本的な操作</h3>
                  <ShortcutKeyItem
                    keys={["enter"]}
                    description="テキスト行を挿入"
                  />
                  <ShortcutKeyItem keys={["⇧", "enter"]} description="改行" />
                  <ShortcutKeyItem keys={["---"]} description="区切り線" />
                </div>

                <div>
                  <h3 className="font-medium mb-2">テキスト書式設定</h3>
                  <ShortcutKeyItem keys={["⌘", "B"]} description="太字" />
                  <ShortcutKeyItem keys={["⌘", "I"]} description="斜体" />
                  <ShortcutKeyItem keys={["⌘", "U"]} description="下線" />
                  <ShortcutKeyItem
                    keys={["⌘", "⇧", "S"]}
                    description="取り消し線"
                  />
                  <ShortcutKeyItem keys={["⌘", "K"]} description="リンク" />
                  <ShortcutKeyItem
                    keys={["⌘", "E"]}
                    description="インラインコード"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">コンテンツ操作</h3>
                  <ShortcutKeyItem keys={["tab"]} description="インデント" />
                  <ShortcutKeyItem
                    keys={["shift", "tab"]}
                    description="ネストを解除"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    コンテンツ作成ショートカット
                  </h3>
                  <ShortcutKeyItem
                    keys={["⌘", "⇧", "0"]}
                    description="テキスト"
                  />
                  <ShortcutKeyItem
                    keys={["⌘", "⇧", "1"]}
                    description="見出し1"
                  />
                  <ShortcutKeyItem
                    keys={["⌘", "⇧", "2"]}
                    description="見出し2"
                  />
                  <ShortcutKeyItem
                    keys={["⌘", "⇧", "3"]}
                    description="見出し3"
                  />
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default HintModal;
