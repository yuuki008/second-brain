import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";

const CodeBlockShiki = ({ node }: NodeViewProps) => {
  const { language } = node.attrs;
  console.log("Hello World");

  return (
    <NodeViewWrapper>
      <pre className="border rounded-md p-4 my-4 text-sm">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockShiki;
