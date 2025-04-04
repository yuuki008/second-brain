import { useEditor, EditorContent } from "@tiptap/react";
import { generateExtensions } from "./extensions";
import { cn } from "@/lib/utils";
import { TextMenu } from "./components/text-menu";
import "./styles/markdown.css";
import { TableOfContentData } from "@tiptap-pro/extension-table-of-contents";
import { useState } from "react";
import ToC from "./components/toc";

type Props = {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  readOnly?: boolean;
};

const Editor = ({ content, onChange, className, readOnly }: Props) => {
  const [tableOfContentData, setTableOfContentData] =
    useState<TableOfContentData>([]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: !readOnly,
    extensions: generateExtensions({ setTableOfContentData }),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "markdown-editor focus:outline-none dark:prose-invert h-full px-1",
      },
    },
    editable: !readOnly,
  });

  if (!editor) return <></>;

  return (
    <div className={cn("w-full h-full", className)}>
      <ToC items={tableOfContentData} editor={editor} />
      <EditorContent className="h-full" editor={editor} />
      {!readOnly && <TextMenu editor={editor} />}
    </div>
  );
};

export default Editor;
