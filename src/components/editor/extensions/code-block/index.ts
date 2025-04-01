import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./code-block-component";

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, string>;
}

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: "codeBlock",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "text*",

  marks: "",

  group: "block",

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-language"),
        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }

          return {
            "data-language": attributes.language,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ["code", {}, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
      Enter: () => {
        // コードブロック内の場合、デフォルトの改行動作を維持
        if (this.editor.isActive("codeBlock")) {
          return false;
        }

        return false;
      },
      Backspace: () => {
        // コードブロック内の場合、処理をスキップ
        return false;
      },
    };
  },

  // バックティック3つの入力でコードブロックを作成
  addInputRules() {
    const backtickInputRule = new InputRule({
      find: /^```\s*$/,
      handler: ({ commands }) => {
        commands.setNode(this.name);
      },
    });

    return [backtickInputRule];
  },
});
