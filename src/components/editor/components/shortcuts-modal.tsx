import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { memo, useState, useEffect, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

const ShortcutItem = memo(
  ({ shortcut, description }: { shortcut: string; description: string }) => {
    return (
      <div className="flex space-x-2 justify-between items-center py-[2px]">
        <span className="text-sm">{description}</span>
        <code className="bg-muted flex-shrink-0 px-2 py-1 rounded text-xs">
          {shortcut}
        </code>
      </div>
    );
  }
);

ShortcutItem.displayName = "ShortcutItem";

export const ShortcutsModal = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // キーボードショートカットの設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setVisible(!visible);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="ghost"
          size="icon"
          aria-label="ショートカット情報"
          onClick={() => setVisible(!visible)}
        >
          <Icon name="Info" />
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
            className="fixed top-20 left-4 z-50 bg-background border rounded-lg shadow-lg w-[400px] max-h-[80vh] overflow-y-auto"
            style={{ resize: "both" }}
          >
            <div className="cursor-move draggable-handle">
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">基本的な操作</h3>
                  <ShortcutItem
                    shortcut="Enter"
                    description="テキスト行を挿入"
                  />
                  <ShortcutItem shortcut="shift + Enter" description="改行" />
                  <ShortcutItem shortcut="---" description="区切り線" />
                </div>

                <div>
                  <h3 className="font-medium mb-2">テキスト書式設定</h3>
                  <ShortcutItem shortcut="cmd/ctrl + B" description="太字" />
                  <ShortcutItem shortcut="cmd/ctrl + I" description="斜体" />
                  <ShortcutItem shortcut="cmd/ctrl + U" description="下線" />
                  <ShortcutItem
                    shortcut="cmd/ctrl + shift + S"
                    description="取り消し線"
                  />
                  <ShortcutItem shortcut="cmd/ctrl + K" description="リンク" />
                  <ShortcutItem
                    shortcut="cmd/ctrl + E"
                    description="インラインコード"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">コンテンツ操作</h3>
                  <ShortcutItem shortcut="tab" description="インデント" />
                  <ShortcutItem
                    shortcut="shift + tab"
                    description="ネストを解除"
                  />
                  <ShortcutItem
                    shortcut="/turn"
                    description="ブロックタイプを変更"
                  />
                  <ShortcutItem
                    shortcut="/color"
                    description="ブロックの文字色や背景色を変更"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    コンテンツ作成ショートカット
                  </h3>
                  <ShortcutItem
                    shortcut="cmd/ctrl + option/shift + 0"
                    description="テキスト"
                  />
                  <ShortcutItem
                    shortcut="cmd/ctrl + option/shift + 1"
                    description="見出し1"
                  />
                  <ShortcutItem
                    shortcut="cmd/ctrl + option/shift + 2"
                    description="見出し2"
                  />
                  <ShortcutItem
                    shortcut="cmd/ctrl + option/shift + 3"
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
