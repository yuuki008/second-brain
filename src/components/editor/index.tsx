import { useEditor, EditorContent, AnyExtension } from "@tiptap/react";
import { extensions } from "./extensions";
import { cn } from "@/lib/utils";
import { TextMenu } from "./components/text-menu";
import "./styles/markdown.css";
import "./styles/code-highlight.css";
import { useEffect } from "react";

// Prism.jsのインポートと言語ロードの順序を修正
import Prism from "prismjs";
// コア言語をロード
import "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
// 追加の言語ハイライト
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";

type Props = {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  readOnly?: boolean;
};

const Editor = ({ content, onChange, className, readOnly = false }: Props) => {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: !readOnly,
    extensions: extensions as AnyExtension[],
    content: content,
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

  // コードブロックのシンタックスハイライト適用
  useEffect(() => {
    if (editor) {
      const highlightCode = () => {
        // タイマーをセットして非同期に処理
        setTimeout(() => {
          try {
            const codeBlocks = document.querySelectorAll(
              "pre code[class*='language-']"
            );
            if (codeBlocks.length > 0) {
              codeBlocks.forEach((block) => {
                Prism.highlightElement(block);
              });
            }
          } catch (error) {
            console.error("Syntax highlighting error:", error);
          }
        }, 0);
      };

      // エディタの内容が変更されたときにハイライト
      editor.on("update", highlightCode);

      // 初期表示時にもハイライト
      highlightCode();

      return () => {
        editor.off("update", highlightCode);
      };
    }
  }, [editor]);

  if (!editor) return <></>;

  return (
    <div className={cn("markdown-editor", className)}>
      <EditorContent className="h-full" editor={editor} />
      {!readOnly && <TextMenu editor={editor} />}
    </div>
  );
};

export default Editor;
