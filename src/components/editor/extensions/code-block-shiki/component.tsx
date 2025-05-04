import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { BundledTheme } from "shiki";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

type SupportedLanguage = {
  name: string;
  label: string;
};

const supportedLanguages: SupportedLanguage[] = [
  { name: "javascript", label: "JavaScript" },
  { name: "typescript", label: "TypeScript" },
  { name: "python", label: "Python" },
  { name: "go", label: "Go" },
  { name: "rust", label: "Rust" },
  { name: "html", label: "HTML" },
  { name: "css", label: "CSS" },
  { name: "json", label: "JSON" },
  { name: "yaml", label: "YAML" },
  { name: "markdown", label: "Markdown" },
  { name: "plaintext", label: "Plaintext" },
];

const CodeBlockShikiComponent = ({ node, updateAttributes }: NodeViewProps) => {
  const { resolvedTheme } = useTheme();
  const { language } = node.attrs;

  function handleLanguageChange(newLanguage: string): void {
    updateAttributes({ language: newLanguage });
  }

  const handleCopy = () => {
    const code = node.content.toString();
    navigator.clipboard.writeText(code);
    toast.success("コードをコピーしました");
  };

  useEffect(() => {
    const shikiTheme: BundledTheme =
      resolvedTheme === "dark" ? "github-dark" : "github-light";

    if (node.attrs.theme !== shikiTheme) {
      updateAttributes({ theme: shikiTheme });
    }
  }, [resolvedTheme, updateAttributes, node.attrs.theme]);

  return (
    <NodeViewWrapper className="relative flex flex-col border rounded-sm my-4 ">
      <div className="flex items-center justify-between border-b p-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="h-7 text-xs border-none w-32 focus:outline-none focus:ring-0">
            <SelectValue placeholder="言語を選択" />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((lang) => (
              <SelectItem key={lang.name} value={lang.name} className="text-xs">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={handleCopy}
        >
          <CopyIcon className="w-4 h-4" />
        </Button>
      </div>
      <pre className="font-mono p-4 text-xs font-light">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockShikiComponent;
