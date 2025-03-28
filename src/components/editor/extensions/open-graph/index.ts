import { Node, Command, RawCommands } from "@tiptap/core";
import { OpenGraphNode } from "./open-graph-node";
import { ReactNodeViewRenderer, nodePasteRule } from "@tiptap/react";

export const OGPLink = Node.create({
  name: "ogp",
  priority: 900,
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='ogp']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "ogp", ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(OpenGraphNode);
  },

  addPasteRules() {
    const urlRegex = /^https?:\/\/[^\s]+$/g;

    return [
      nodePasteRule({
        find: urlRegex,
        type: this.type,
        getAttributes: (match) => {
          return { url: match.input };
        },
      }),
    ];
  },

  addCommands(): Partial<
    RawCommands & { setOGPLink: (url: string) => Command }
  > {
    return {
      setOGPLink:
        (url: string): Command =>
        ({ editor }) => {
          return editor.commands.insertContent({
            type: this.name,
            attrs: { url },
          });
        },
    };
  },
});
