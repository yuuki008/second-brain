import { Editor, useEditorState } from "@tiptap/react";
import { useCallback } from "react";
import { ShouldShowProps } from "@/components/editor/types";
import { isTextSelected } from "@/components/editor/lib/utils";

export const useTextmenuStates = (editor: Editor) => {
  const states = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isStrike: ctx.editor.isActive("strike"),
        isUnderline: ctx.editor.isActive("underline"),
        isCode: ctx.editor.isActive("code"),
        isSubscript: ctx.editor.isActive("subscript"),
        isSuperscript: ctx.editor.isActive("superscript"),
        isAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
        isAlignCenter: ctx.editor.isActive({ textAlign: "center" }),
        isAlignRight: ctx.editor.isActive({ textAlign: "right" }),
        isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }),
        currentColor: ctx.editor.getAttributes("textStyle")?.color || undefined,
        currentHighlight:
          ctx.editor.getAttributes("highlight")?.color || undefined,
        currentFont:
          ctx.editor.getAttributes("textStyle")?.fontFamily || undefined,
        currentSize:
          ctx.editor.getAttributes("textStyle")?.fontSize || undefined,
      };
    },
  });

  const shouldShow = useCallback(
    ({ view }: ShouldShowProps) => {
      if (!view || editor.view.dragging) {
        return false;
      }

      return isTextSelected({ editor });
    },
    [editor]
  );

  return {
    shouldShow,
    ...states,
  };
};
