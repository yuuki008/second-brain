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
import { Link } from "./link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import FontSize from "@tiptap/extension-font-size";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";

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
  Link,
  Youtube,
  TextAlign,
  Underline,
  Subscript,
  Superscript,
  Color,
  FontFamily,
  Highlight,
  FontSize,
  TaskItem,
  TaskList,
];
