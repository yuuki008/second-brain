import { Button } from "@/components/ui/button";
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

export const ShortcutsModal = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // キーボードショートカットの設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setVisible(!visible);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          className="cursor-pointer h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100"
          variant="ghost"
          onClick={() => setVisible(!visible)}
        >
          <kbd className="flex items-center gap-1">
            <div className="text-xs">⌘</div>H
          </kbd>
        </Button>
      </div>

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
            className="fixed top-20 left-4 z-50 bg-background border rounded-lg shadow-lg w-[400px] max-h-[570px] overflow-y-auto"
            style={{ resize: "both" }}
          >
            <div className="cursor-move draggable-handle">
              <div className="p-4 space-y-4">
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
