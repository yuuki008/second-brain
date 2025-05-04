import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    keyboardShortcuts: {
      setParagraph: () => ReturnType;
      toggleHeading: ({ level }: { level: number }) => ReturnType;
      toggleCodeBlock: () => ReturnType;
      toggleTaskList: () => ReturnType;
      toggleTaskItem: () => ReturnType;
      toggleCodeBlockShiki: () => ReturnType;
      toggleBlockquote: () => ReturnType;
      toggleBulletList: () => ReturnType;
      toggleOrderedList: () => ReturnType;
    };
  }
}

export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("keyboardShortcuts"),
        props: {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            // Check for Cmd/Ctrl + Option/Shift + Number combinations
            const isMac = navigator.platform.includes("Mac");
            const modKey = event.metaKey || event.ctrlKey;
            const altOptionKey = isMac ? event.altKey : event.shiftKey;
            const shiftKey = event.shiftKey;

            // Need either Option (Mac) or Shift (Windows/Linux)
            if (!modKey || !(altOptionKey || shiftKey)) {
              return false;
            }

            // Handle number keys (0-9)
            if (event.key >= "0" && event.key <= "9") {
              event.preventDefault();

              switch (event.key) {
                case "0": // テキスト
                  editor.chain().focus().setParagraph().run();
                  return true;

                case "1": // 見出し1
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  return true;

                case "2": // 見出し2
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  return true;

                case "3": // 見出し3
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                  return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
