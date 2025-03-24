import { useEditor, EditorContent, AnyExtension } from "@tiptap/react";
import { extensions } from "./extensitions";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  onChange: (content: string) => void;
  className?: string;
};

const Editor = ({ content, onChange, className }: Props) => {
  const editor = useEditor({
    autofocus: true,
    extensions: extensions as AnyExtension[],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert h-full focus:outline-none",
      },
    },
  });

  return (
    <div
      className={cn(
        "w-full h-full overflow-auto border-none bg-transparent",
        "prose-headings:font-bold prose-headings:text-foreground",
        "prose-h1:text-2xl prose-h1:mb-3",
        "prose-h2:text-xl prose-h2:mb-2",
        "prose-h3:text-lg prose-h3:mb-1",
        "prose-p:text-sm prose-p:text-foreground prose-p:mb-1",
        "prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4",
        "prose-li:mb-1",
        "prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm",
        "prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-auto",
        "prose-img:max-w-full prose-img:rounded-md",
        "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
        "prose-hr:border-muted prose-hr:my-4",
        "prose-table:w-full prose-table:border-collapse",
        "prose-th:border prose-th:border-muted prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left",
        "prose-td:border prose-td:border-muted prose-td:p-2",
        "prose-thead:bg-muted/30",
        "[&_ul.task-list]:pl-0 [&_ul.task-list]:list-none",
        "[&_ul.task-list_li]:flex [&_ul.task-list_li]:items-start [&_ul.task-list_li]:gap-2",
        "[&_ul.task-list_li_input]:mt-1 [&_ul.task-list_li_input]:h-4 [&_ul.task-list_li_input]:w-4",
        "[&_.ProseMirror-selectednode]:outline-none [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-primary",
        "[&_iframe.youtube-video]:w-full [&_iframe.youtube-video]:rounded-lg [&_iframe.youtube-video]:shadow-md",
        "[&_pre]:font-mono [&_pre]:text-sm",
        "[&_pre_code]:text-foreground",
        className
      )}
    >
      <EditorContent className="h-full" editor={editor} />
    </div>
  );
};

export default Editor;
