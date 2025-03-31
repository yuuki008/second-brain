import { Editor, ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { Instance as TippyInstance } from "tippy.js";
import type { SuggestionProps } from "@tiptap/suggestion";
import { EmojiList } from "./emoji-list";
import { Emoji } from "@tiptap-pro/extension-emoji";

interface EmojiItem {
  shortcodes: string[];
  tags: string[];
  emoji: string;
}

interface EmojiStorage {
  emojis: EmojiItem[];
}

interface EmojiListRef {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

const suggestion = {
  items: ({ editor, query }: { editor: Editor; query: string }) => {
    const emojiStorage = editor.storage as { emoji: EmojiStorage };
    return emojiStorage.emoji.emojis
      .filter(({ shortcodes, tags }: EmojiItem) => {
        return (
          shortcodes.find((shortcode: string) =>
            shortcode.startsWith(query.toLowerCase())
          ) || tags.find((tag: string) => tag.startsWith(query.toLowerCase()))
        );
      })
      .slice(0, 5);
  },

  allowSpaces: false,

  render: () => {
    let component: ReactRenderer<EmojiListRef>;
    let popup: TippyInstance;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(EmojiList, {
          props,
          editor: props.editor,
        });

        popup = tippy(document.body, {
          getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: SuggestionProps) {
        component.updateProps(props);

        popup.setProps({
          getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
        });
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === "Escape") {
          popup.hide();
          component.destroy();
          return true;
        }

        return component.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup.destroy();
        component.destroy();
      },
    };
  },
};

const EmojiExtension = Emoji.configure({
  suggestion,
});

export default EmojiExtension;
