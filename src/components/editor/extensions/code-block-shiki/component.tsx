import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { language } = node.attrs;

  function handleLanguageChange(newLanguage: string): void {
    updateAttributes({ language: newLanguage });
  }

  return (
    <NodeViewWrapper className="relative group border rounded-md p-4 my-4 ">
      <div className="absolute top-2 right-2 opacity-0 bg-background group-hover:opacity-100 transition-opacity duration-200">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[120px] h-7 text-xs">
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
      </div>
      <pre className="text-sm font-mono">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockShikiComponent;
