import StarterKit from "@tiptap/starter-kit";
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
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { Details } from "@tiptap-pro/extension-details";
import DetailsContent from "@tiptap-pro/extension-details-content";
import DetailsSummary from "@tiptap-pro/extension-details-summary";
export { Details } from "@tiptap-pro/extension-details";
export { DetailsContent } from "@tiptap-pro/extension-details-content";
export { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { Blockquote } from "./blockquote";

export type GenerateExtensionsArgs = TableOfContentsExtensionArgs;

export const generateExtensions = ({
  setTableOfContentData,
}: GenerateExtensionsArgs) => {
  return [
    StarterKit.configure({
      blockquote: false,
    }),
    Blockquote,
    generateTableOfContents({ setTableOfContentData }),
    CodeBlockLowlightExtension,
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
    Table,
    TableCell,
    TableHeader,
    TableRow,
    KeyboardShortcuts,
    Details,
    DetailsContent,
    DetailsSummary,
  ];
};
