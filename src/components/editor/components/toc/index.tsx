import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TableOfContentData,
  TableOfContentDataItem,
} from "@tiptap-pro/extension-table-of-contents";
import { TextSelection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

type ToCItemProps = {
  item: TableOfContentDataItem;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
};

export const ToCItem = ({ item, onItemClick }: ToCItemProps) => {
  return (
    <div
      className={cn(
        "text-sm transition-colors duration-300 font-light relative overflow-hidden",
        item.isActive && !item.isScrolledOver
          ? "text-muted-foreground"
          : "text-primary",
        item.isScrolledOver && "text-muted-foreground"
      )}
      style={{
        paddingLeft: `${(item.level - 1 || 0) * 10}px`,
        maxWidth: "100%",
      }}
    >
      <a
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
        data-item-index={item.itemIndex}
        className="block whitespace-nowrap text-ellipsis overflow-hidden"
      >
        {item.textContent}
      </a>
    </div>
  );
};

type Props = {
  items: TableOfContentData;
  editor: Editor;
};

const BREAKPOINT_MD = 1330;

export default function ToC({ items, editor }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // 画面サイズに基づいて初期状態を設定
  useEffect(() => {
    const handleResize = () => {
      // md以上の画面サイズではデフォルトで開く
      setIsOpen(window.innerWidth >= BREAKPOINT_MD);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!editor.isInitialized) return <></>;

  const onItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (!editor) return;

    const element = editor.view.dom.querySelector(`[data-toc-id="${id}"`);
    if (!element) return;

    const pos = editor.view.posAtDOM(element, 0);

    // set focus
    const tr = editor.view.state.tr;
    tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
    editor.view.dispatch(tr);
    editor.view.focus();

    history.pushState(null, "", `#${id}`);

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY,
      behavior: "smooth",
    });

    // モバイルであれば目次を閉じる
    if (window.innerWidth < BREAKPOINT_MD) setIsOpen(false);
  };

  // 現在のスクロール位置に基づいて進捗率を計算
  const calculateProgress = () => {
    const scrollPosition = window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress = Math.round((scrollPosition / documentHeight) * 100);

    if (isNaN(progress)) return 0;

    return progress > 100 ? 100 : progress;
  };

  const progress = calculateProgress();

  return (
    <div
      style={{
        maxWidth: `${BREAKPOINT_MD}px`,
      }}
      className="fixed z-[20] top-0 left-1/2 -translate-x-1/2 w-full h-0"
    >
      <div className="absolute top-2 right-4 p-3 bg-secondary text-secondary-foreground rounded-xl shadow-xl w-[300px] overflow-hidden">
        {/* ヘッダー部分 - クリック可能エリア */}
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <div className="text-sm font-medium">目次</div>
            <ChevronUp
              className={cn(
                "w-4 h-4 mx-1 transition-transform duration-300",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {progress}%
          </Badge>
        </div>

        {/* コンテンツ部分 */}
        <div
          className={cn(
            "max-h-0 overflow-auto transition-height duration-300 ease-in-out",
            isOpen && "max-h-[50vh] mt-3"
          )}
        >
          <div className="space-y-2">
            {items.length ? (
              items.map((item) => (
                <ToCItem onItemClick={onItemClick} key={item.id} item={item} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                目次がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
