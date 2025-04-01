import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const CodeBlockComponent: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, extension } = props;
  const language = node.attrs.language || "null";
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    updateAttributes({ language: value });
    setOpen(false);
  };

  // 言語の表示名
  const getLanguageLabel = (lang: string) => {
    return lang === "null" ? "auto" : lang;
  };

  const languages = ["null", ...extension.options.lowlight.listLanguages()];

  return (
    <NodeViewWrapper className="code-block">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 px-2 h-8">
            {getLanguageLabel(selectedLanguage)}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]">
          <Command>
            <CommandInput placeholder="言語を検索..." />
            <CommandList>
              <CommandEmpty>見つかりませんでした</CommandEmpty>
              <CommandGroup>
                {languages.map((lang, index) => (
                  <CommandItem
                    key={index}
                    value={lang}
                    onSelect={() =>
                      handleLanguageChange(lang === "auto" ? "null" : lang)
                    }
                  >
                    {lang === "null" ? "auto" : lang}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};
