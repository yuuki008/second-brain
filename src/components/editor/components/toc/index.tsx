import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TableOfContentData,
  TableOfContentDataItem,
} from "@tiptap-pro/extension-table-of-contents";
import { TextSelection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

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

export default function ToC({ items, editor }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return <></>;
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

    // 目次を閉じる
    setIsOpen(false);
  };

  // 現在のスクロール位置に基づいて進捗率を計算
  const calculateProgress = () => {
    const scrollPosition = window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    return Math.round((scrollPosition / documentHeight) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "flex flex-col bg-secondary text-secondary-foreground p-3 rounded-xl shadow-lg cursor-pointer transition-all duration-300 min-w-[200px] max-w-[95%]"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={cn(
            "h-0 w-0 max-h-[300px] overflow-auto transition-all duration-300",
            isOpen && "h-auto w-auto mb-4"
          )}
        >
          <div className="space-y-1 p-2">
            {items.map((item) => (
              <ToCItem onItemClick={onItemClick} key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="flex items-center w-full justify-between">
          <div className="flex items-center">
            <div className="text-sm font-medium">目次</div>
            <ChevronsUpDown className="w-4 h-4 mx-1" />
          </div>

          <Badge variant="outline" className="text-xs">
            {progress}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
