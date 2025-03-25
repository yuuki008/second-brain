import { useEditor, EditorContent, AnyExtension } from "@tiptap/react";
import { extensions } from "./extensions";
import { cn } from "@/lib/utils";
import { TextMenu } from "./components/TextMenu";
import "./styles/markdown.css";

type Props = {
  content: string;
  onChange: (content: string) => void;
  className?: string;
};

const Editor = ({ content, onChange, className }: Props) => {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: true,
    extensions: extensions as AnyExtension[],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "markdown-editor focus:outline-none dark:prose-invert h-full",
      },
    },
  });

  if (!editor) return <></>;

  return (
    <div className={cn("markdown-editor", className)}>
      <EditorContent className="h-full" editor={editor} />
      <TextMenu editor={editor} />
    </div>
  );
};

export default Editor;
