// components/editor/CodeBlockComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/themes/prism-tomorrow.css";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const LanguagePopover = ({
  selectedLanguage,
  selectLanguage,
  languages,
}: {
  languages: { name: string; label: string }[];
  selectedLanguage: string;
  selectLanguage: (language: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("absolute top-0 right-0 transition-opacity duration-200")}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 px-3 h-7">
            {languages.find((lang) => lang.name === selectedLanguage)?.label}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]">
          <Command>
            <CommandInput placeholder="言語を検索..." />
            <CommandList>
              <CommandEmpty>見つかりませんでした</CommandEmpty>
              <CommandGroup>
                {languages.map((lang: { name: string; label: string }) => (
                  <CommandItem
                    key={lang.name}
                    value={lang.name}
                    onSelect={() => {
                      selectLanguage(lang.name);
                      setOpen(false);
                    }}
                  >
                    {lang.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function CodeBlockComponent({
  node,
  extension,
  updateAttributes,
}: NodeViewProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  const languages = extension.options.languages;

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [node.attrs.language, node.textContent]);

  const selectLanguage = (value: string) => {
    updateAttributes({ language: value });
    setTimeout(() => {
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    }, 0);
  };

  return (
    <NodeViewWrapper className="relative my-4">
      <LanguagePopover
        selectedLanguage={node.attrs.language}
        selectLanguage={selectLanguage}
        languages={languages}
      />

      <pre
        ref={codeRef}
        className={`language-${node.attrs.language} p-4 m-0 overflow-x-auto text-sm`}
      >
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
