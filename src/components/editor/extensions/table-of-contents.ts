import {
  getHierarchicalIndexes,
  TableOfContentData,
  TableOfContents,
} from "@tiptap-pro/extension-table-of-contents";

export interface TableOfContentsExtensionArgs {
  setTableOfContentData: (tableOfContentData: TableOfContentData) => void;
}

export default function generateTableOfContents({
  setTableOfContentData,
}: TableOfContentsExtensionArgs) {
  return TableOfContents.configure({
    getIndex: getHierarchicalIndexes,
    onUpdate(content: TableOfContentData) {
      setTableOfContentData(content);
    },
  });
}
