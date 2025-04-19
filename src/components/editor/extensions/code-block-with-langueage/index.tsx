// components/editor/extensions/CodeBlockWithLanguage.tsx
import { CodeBlockOptions, CodeBlock } from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./code-block";

interface CodeBlockWithLanguageOptions extends CodeBlockOptions {
  languages: { name: string; label: string }[];
}

const CodeBlockWithLanguage = CodeBlock.extend<CodeBlockWithLanguageOptions>({
  name: "codeBlock",

  addOptions() {
    return {
      ...this.parent?.(),
      languages: [
        { name: "typescript", label: "TypeScript" },
        { name: "javascript", label: "JavaScript" },
        { name: "css", label: "CSS" },
        { name: "html", label: "HTML" },
        { name: "json", label: "JSON" },
        { name: "jsx", label: "JSX" },
        { name: "tsx", label: "TSX" },
        { name: "bash", label: "Bash" },
        { name: "python", label: "Python" },
        { name: "java", label: "Java" },
      ],
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: "typescript",
        parseHTML: (element) =>
          element.getAttribute("data-language") || "typescript",
        renderHTML: (attributes) => {
          return {
            "data-language": attributes.language,
            class: `language-${attributes.language}`,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});

export default CodeBlockWithLanguage;
