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
        "text-sm transition-colors duration-300",
        item.isActive && !item.isScrolledOver
          ? "text-muted-foreground"
          : "text-primary",
        item.isScrolledOver && "text-muted-foreground"
      )}
      style={{
        paddingLeft: `${item.level * 10}px`,
      }}
    >
      <a
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
        data-item-index={item.itemIndex}
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
        className="flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="text-sm font-medium">Index</span>
          <ChevronsUpDown className="w-4 h-4 mx-1" />
          <span className="bg-gray-200 dark:bg-gray-700 text-xs rounded-full px-2 py-1">
            {progress}%
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-2 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg max-h-[70vh] overflow-auto">
          <ul className="space-y-1">
            {items.map((item) => (
              <ToCItem onItemClick={onItemClick} key={item.id} item={item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
