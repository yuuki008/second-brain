import { Editor, Extension, Range } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import { Suggestion, SuggestionKeyDownProps } from "@tiptap/suggestion";
import tippy, { Instance, Props } from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  Code,
  List,
  ListChecks,
  Minus,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// CommandProps をここで定義
interface CommandProps {
  editor: Editor;
  range: Range;
}

interface CommandItemProps {
  title: string;
  icon: React.ReactNode;
  onCommand: (props: CommandProps) => void;
}

// レンダラーのプロパティ型
interface RendererProps {
  editor: Editor;
  clientRect: (() => DOMRect) | undefined;
  [key: string]: unknown;
}

// コマンドアイテムの型
interface CommandItem {
  title: string;
  icon: React.ReactNode;
  onCommand: (props: CommandProps) => void;
}

// コマンドリストのプロパティ型
interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  editor: Editor;
}

// キーダウンハンドラーの型
interface KeyDownHandlerResult {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// 拡張されたCommandListコンポーネント
const CommandListWithKeyboardHandling = forwardRef<
  KeyDownHandlerResult,
  CommandListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = props.items as CommandItem[];
  const commandFn = props.command as (item: CommandItem) => void;

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      commandFn(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="relative bg-background border rounded-md p-1 shadow-lg overflow-hidden">
      {items.length > 0 ? (
        <div className="command-list">
          {items.map((item: CommandItem, index: number) => (
            <button
              key={index}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1 text-left rounded-sm text-sm transition-colors duration-200",
                index === selectedIndex
                  ? "bg-secondary text-secondary-foreground"
                  : ""
              )}
              onClick={() => selectItem(index)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-2 py-1 text-sm text-muted-foreground">
          一致するコマンドがありません
        </div>
      )}
    </div>
  );
});

CommandListWithKeyboardHandling.displayName = "CommandListWithKeyboardHandling";

const Command = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: CommandItemProps;
        }) => {
          props.onCommand({ editor, range });
        },
        items: ({ query }: { query: string }) => {
          return [
            {
              title: "見出し1",
              icon: <Heading1 size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode("heading", { level: 1 })
                  .run();
              },
            },
            {
              title: "見出し2",
              icon: <Heading2 size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode("heading", { level: 2 })
                  .run();
              },
            },
            {
              title: "見出し3",
              icon: <Heading3 size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode("heading", { level: 3 })
                  .run();
              },
            },
            {
              title: "画像",
              icon: <ImageIcon className="w-4 h-4" />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setImage({ src: "", alt: "", loading: false })
                  .run();
              },
            },
            {
              title: "動画",
              icon: <VideoIcon className="w-4 h-4" />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setVideo({ src: "", loading: false })
                  .run();
              },
            },
            {
              title: "コードブロック",
              icon: <Code size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleCodeBlock()
                  .run();
              },
            },
            {
              title: "リスト",
              icon: <List size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBulletList()
                  .run();
              },
            },
            {
              title: "タスクリスト",
              icon: <ListChecks size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleTaskList()
                  .run();
              },
            },
            {
              title: "区切り線",
              icon: <Minus size={18} />,
              onCommand: ({ editor, range }: CommandProps) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHorizontalRule()
                  .run();
              },
            },
          ].filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: Instance<Props> | null = null;

          return {
            onStart: (props: RendererProps) => {
              component = new ReactRenderer(CommandListWithKeyboardHandling, {
                props,
                editor: props.editor,
              });

              const element = document.querySelector("body");
              if (!element) return;

              popup = tippy(element, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate: (props: RendererProps) => {
              component?.updateProps(props);

              if (!popup) return;

              popup.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                if (!popup) return true;
                popup.hide();
                return true;
              }

              // ref が KeyDownHandlerResult 型を持つことを保証
              const ref = component?.ref as KeyDownHandlerResult | undefined;
              if (!ref || !ref.onKeyDown) return false;

              return ref.onKeyDown(props);
            },

            onExit: () => {
              if (!popup) return;

              popup.destroy();
              if (component) {
                component.destroy();
              }
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default Command;
