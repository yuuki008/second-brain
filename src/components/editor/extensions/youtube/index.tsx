import { nodePasteRule, ReactNodeViewRenderer } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import YouTubeComponent from "./youtube-component";

export const YouTubeExtension = Node.create({
  name: "youtube",

  priority: 1000,

  group: "block",

  atom: true,

  draggable: true,

  addPasteRules() {
    const youtubeUrl =
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/g;

    return [
      nodePasteRule({
        find: youtubeUrl,
        type: this.type,
        getAttributes: (match) => {
          return { url: match.input };
        },
      }),
    ];
  },

  addAttributes() {
    return {
      url: {
        default: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "youtube",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["youtube", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeComponent);
  },
});
