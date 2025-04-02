import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
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
import { TweetExtension } from "./tweet";
import { OGPLink } from "./open-graph";
import { Image } from "./image";
import { Video } from "./video";
import { YouTubeExtension } from "./youtube";
import EmojiExtension from "./emoji";
import FileHandlerExtension from "./file-handler";
import CodeBlockLowlightExtension from "./code-block-low-light";
import generateTableOfContents from "./table-of-contents";
import { TableOfContentsExtensionArgs } from "./table-of-contents";

export type GenerateExtensionsArgs = TableOfContentsExtensionArgs;

export const generateExtensions = ({
  setTableOfContentData,
}: GenerateExtensionsArgs) => {
  return [
    StarterKit,
    generateTableOfContents({ setTableOfContentData }),
    CodeBlockLowlightExtension,
    Heading,
    Paragraph,
    ListItem,
    OrderedList,
    BulletList,
    Blockquote,
    Link,
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
    TweetExtension,
    EmojiExtension,
    OGPLink,
    Image,
    FileHandlerExtension,
    Video,
    YouTubeExtension,
  ];
};
