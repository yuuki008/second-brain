import { EditorContent, type Editor as EditorInstance } from "@tiptap/react";
import { cn } from "@/lib/utils";
import "./styles/markdown.css";
import { memo } from "react";

type Props = {
  editor: EditorInstance | null;
  className?: string;
};

const Editor = memo(({ editor, className }: Props) => {
  return (
    <div className={cn("w-full h-full", className)}>
      <EditorContent className="h-full" editor={editor} />
    </div>
  );
});

Editor.displayName = "Editor";
export default Editor;
