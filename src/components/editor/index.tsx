import { useEditor, EditorContent, AnyExtension } from "@tiptap/react";
import { extensions } from "./extensitions";
type Props = {
  content: string;
  onChange: (content: string) => void;
};

const Editor = ({ content, onChange }: Props) => {
  const editor = useEditor({
    autofocus: true,
    extensions: extensions as AnyExtension[],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return <EditorContent className="h-full w-full" editor={editor} />;
};

export default Editor;
