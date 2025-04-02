import { cn } from "@/lib/utils";
import {
  TableOfContentData,
  TableOfContentDataItem,
} from "@tiptap-pro/extension-table-of-contents";
import { TextSelection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";

type ToCItemProps = {
  item: TableOfContentDataItem;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
};

export const ToCItem = ({ item, onItemClick }: ToCItemProps) => {
  return (
    <div
      className={cn(item.isActive ? "text-primary" : "text-muted-foreground")}
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
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <ul className="space-y-1">
        {items.map((item) => (
          <ToCItem onItemClick={onItemClick} key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
