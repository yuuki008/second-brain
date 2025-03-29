import { Node, nodeInputRule } from "@tiptap/react";

export interface VideoOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /**
       * Set a video node
       */
      setVideo: (src: string) => ReturnType;
      /**
       * Toggle a video
       */
      toggleVideo: (src: string) => ReturnType;
    };
  }
}

const VIDEO_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const Video = Node.create({
  name: "video",

  group: "block",

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("src"),
        renderHTML: (attrs) => ({ src: attrs.src }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
        getAttrs: (el) => ({
          src: (el as HTMLVideoElement).getAttribute("src"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      { controls: "true", style: "width: 100%", ...HTMLAttributes },
      ["source", HTMLAttributes],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (src: string) =>
        ({ commands }) =>
          commands.insertContent(
            `<video controls="true" style="width: 100%" src="${src}" />`
          ),

      toggleVideo:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, "paragraph"),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: VIDEO_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const [, , src] = match;

          return { src };
        },
      }),
    ];
  },
});
