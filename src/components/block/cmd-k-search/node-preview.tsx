import { Node, Tag } from "@prisma/client";
import {
  useEditor,
  Editor as EditorInstance,
  AnyExtension,
} from "@tiptap/react";
import { generateExtensions } from "@/components/editor/extensions";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Editor from "@/components/editor"; // Assuming Editor is the component wrapper

interface NodePreviewProps {
  node: Node & { tags: Tag[] };
}

// NodePreview component remains largely the same, but ensures editor updates content
export function NodePreview({ node }: NodePreviewProps) {
  const editor = useEditor(
    {
      extensions: generateExtensions() as AnyExtension[],
      content: node.content, // Initial content
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editable: false,
    },
    [node.id] // Re-initialize editor when node.id changes
  );

  // Update content when the focused node changes
  useEffect(() => {
    if (editor && node?.content !== editor.getHTML()) {
      // Use `false` for emitUpdate to avoid potential loops if editor state changes trigger updates
      editor.commands.setContent(node.content, false);
    }
  }, [node, editor]);

  // Render editor only when it's initialized
  // Assuming Editor component handles the 'editor' prop possibly being null initially
  return editor ? (
    <Editor editor={editor as EditorInstance} />
  ) : (
    <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4" />
  );
}
