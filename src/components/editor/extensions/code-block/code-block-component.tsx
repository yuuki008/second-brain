"use client";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { FC, useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Prism from "prismjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 言語選択用のオプション
const languages = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
];

export const CodeBlockComponent: FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const language = node.attrs.language || "";
  const codeRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const setLanguage = (value: string) => {
    updateAttributes({ language: value });
  };

  const handleCopyCode = () => {
    if (codeRef.current) {
      const code = codeRef.current.textContent || "";
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        toast.success("コードをクリップボードにコピーしました");
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  // 言語変更時や内容変更時にハイライトを適用
  useEffect(() => {
    if (codeRef.current && language) {
      try {
        Prism.highlightElement(codeRef.current);
      } catch (error) {
        console.error("Failed to highlight code:", error);
      }
    }
  }, [language, node.textContent]);

  return (
    <NodeViewWrapper
      className="code-block-wrapper relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-2 bg-muted border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              {language
                ? languages.find((l) => l.value === language)?.label || language
                : "言語を選択"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
            <DropdownMenuRadioGroup
              value={language}
              onValueChange={setLanguage}
            >
              {languages.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang.value}
                  value={lang.value}
                  className="cursor-pointer"
                >
                  {lang.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* コピーボタン */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}
        onClick={handleCopyCode}
        aria-label="コードをコピー"
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      {/* コードコンテンツ */}
      <pre
        className={language ? `language-${language}` : ""}
        data-language={language}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <code
          ref={codeRef}
          className={language ? `language-${language}` : ""}
          spellCheck="false"
          onKeyDown={(e) => e.stopPropagation()}
        >
          {node.textContent}
        </code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
