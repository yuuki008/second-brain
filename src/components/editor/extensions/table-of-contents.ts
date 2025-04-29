import {
  getHierarchicalIndexes,
  TableOfContentData,
  TableOfContents,
} from "@tiptap-pro/extension-table-of-contents";

export type TableOfContentsExtensionArgs =
  | {
      setTableOfContentData: (tableOfContentData: TableOfContentData) => void;
    }
  | undefined;

export default function generateTableOfContents(
  args: TableOfContentsExtensionArgs
) {
  return TableOfContents.configure({
    getIndex: getHierarchicalIndexes,
    onUpdate(content: TableOfContentData) {
      if (args?.setTableOfContentData) {
        args.setTableOfContentData(content);
      }
    },
  });
}
