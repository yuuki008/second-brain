import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import { Code } from "lucide-react";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Youtube from "@tiptap/extension-youtube";

export const extensions = [
  StarterKit,
  Heading,
  Paragraph,
  ListItem,
  OrderedList,
  BulletList,
  Blockquote,
  Code,
  CodeBlock,
  Youtube,
];
