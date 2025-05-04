import {
  Node,
  RawCommands,
  SingleCommands,
  textblockTypeInputRule,
} from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockShikiComponent from "./component";
import { tildeInputRegex } from "@tiptap/extension-code-block";
import { backtickInputRegex } from "@tiptap/extension-code-block";
import { ShikiPlugin } from "./shiki-plugin";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeBlockShiki: {
      setCodeBlockShiki: (attributes: Record<string, unknown>) => ReturnType;
    };
  }
}

const CodeBlockShiki = Node.create({
  name: "codeBlockShiki",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: "typescript",
      defaultTheme: "github-light",
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage,
      },
      theme: {
        default: this.options.defaultTheme,
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
    return ["pre", HTMLAttributes, ["code", {}, 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockShikiComponent);
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1],
        }),
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1],
        }),
      }),
    ];
  },

  addCommands(): Partial<RawCommands> {
    return {
      setCodeBlockShiki:
        (attributes: Record<string, unknown>) =>
        ({ commands }: { commands: SingleCommands }) => {
          return commands.setNode(this.name, attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        // If the cursor is not in a code block, do nothing
        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        editor.commands.insertContent("\n");
        return true;
      },
      ArrowDown: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        // If the cursor is not in a code block, do nothing
        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        // If the cursor is not at the end of the code block, do nothing
        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        if (!isAtEnd) {
          return false;
        }

        // If the cursor is at the end of the code block, exit the code block
        return editor.commands.exitCode();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
        defaultTheme: this.options.defaultTheme,
      }),
    ];
  },
});

export default CodeBlockShiki;
