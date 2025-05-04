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

  addAttributes() {
    return {
      language: {
        default: "plaintext",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: false,
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
      Enter: ({ editor }) => editor.commands.insertContent("\n"),
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
});

export default CodeBlockShiki;
