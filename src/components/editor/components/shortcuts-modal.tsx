import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { memo, useState, useEffect } from "react";

const ShortcutItem = memo(
  ({ shortcut, description }: { shortcut: string; description: string }) => {
    return (
      <div className="flex space-x-2 justify-between items-center py-1">
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
  const [open, setOpen] = useState(false);

  // キーボードショートカットの設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="ショートカット情報">
            <Icon name="Info" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-[95%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>コンテンツの作成と書式設定ショートカット</DialogTitle>
            <DialogDescription>
              エディターでの操作をより効率的にするためのショートカット一覧
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium">基本的な操作</h3>
              <ShortcutItem
                shortcut="Enter"
                description="テキスト行を挿入します"
              />
              <ShortcutItem
                shortcut="shift + Enter"
                description="テキストブロックの中で改行します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + shift + M"
                description="コメントを作成します"
              />
              <ShortcutItem
                shortcut="---"
                description="区切り線を作成します（半角ハイフン3つ）"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">テキスト書式設定</h3>
              <ShortcutItem
                shortcut="cmd/ctrl + B"
                description="文字列を選択した状態で太字にします"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + I"
                description="文字列を選択した状態で斜体にします"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + U"
                description="文字列を選択した状態で下線を引きます"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + shift + S"
                description="文字列を選択した状態で取り消し線を引きます"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + K"
                description="文字列を選択した状態でリンクを追加します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + E"
                description="文字列を選択した状態でインラインコードにします"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">コンテンツ操作</h3>
              <ShortcutItem
                shortcut="tab"
                description="コンテンツのインデントとネストを行います"
              />
              <ShortcutItem
                shortcut="shift + tab"
                description="コンテンツのネストを解除します"
              />
              <ShortcutItem
                shortcut="/turn"
                description="ブロックタイプを変更します"
              />
              <ShortcutItem
                shortcut="/color"
                description="ブロックの文字色や背景色を変更します"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">コンテンツ作成ショートカット</h3>
              <p className="text-xs text-muted-foreground">
                Macの場合は cmd + option 、WindowsとLinuxの場合は ctrl + shift
                を使用
              </p>
              <ShortcutItem
                shortcut="cmd/ctrl + option/shift + 0"
                description="テキストを作成します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + option/shift + 1"
                description="見出し1を作成します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + option/shift + 2"
                description="見出し2を作成します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + option/shift + 3"
                description="見出し3を作成します"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">その他のショートカット</h3>
              <ShortcutItem
                shortcut="cmd/ctrl + I"
                description="ショートカット一覧を表示します"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + +"
                description="ズームインします"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + -"
                description="ズームアウトします"
              />
              <ShortcutItem
                shortcut="cmd/ctrl + shift + U"
                description="ページ階層のひとつ上に移動します"
              />
              <ShortcutItem
                shortcut="option/alt + ドラッグアンドドロップ"
                description="Notionページでコンテンツを複製します"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
