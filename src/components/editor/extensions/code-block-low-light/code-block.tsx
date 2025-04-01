import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const CodeBlockComponent: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, extension } = props;
  const language = node.attrs.language || "null";
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    updateAttributes({ language: value });
  };

  // 言語の表示名
  const getLanguageLabel = (lang: string) => {
    return lang === "null" ? "auto" : lang;
  };

  return (
    <NodeViewWrapper className="code-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 px-2 h-8">
            {getLanguageLabel(selectedLanguage)}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 max-h-[300px] overflow-y-auto">
          <DropdownMenuRadioGroup
            value={selectedLanguage}
            onValueChange={handleLanguageChange}
          >
            <DropdownMenuRadioItem value="null">auto</DropdownMenuRadioItem>
            {extension.options.lowlight
              .listLanguages()
              .map((lang: string, index: number) => (
                <DropdownMenuRadioItem key={index} value={lang}>
                  {lang}
                </DropdownMenuRadioItem>
              ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};
