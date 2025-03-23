import { Term } from "@/types";

// サンプルの用語データ
export const allTerms: Term[] = [
  {
    id: "react",
    name: "React",
    definition:
      "Reactはユーザインターフェイスを構築するためのJavaScriptライブラリです。[term:javascript]や[term:typescript]を使って開発されることが多く、[term:component]ベースのアーキテクチャを採用しています。",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-02-15"),
    tags: [
      { id: "frontend", name: "フロントエンド", color: "#61dafb" },
      { id: "library", name: "ライブラリ", color: "#1da1f2" },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    definition:
      "JavaScriptは動的型付けのプログラミング言語で、Webページに動的な機能を追加するために使われます。[term:typescript]はJavaScriptの上位互換です。",
    createdAt: new Date("2023-01-05"),
    updatedAt: new Date("2023-03-10"),
    tags: [
      { id: "language", name: "言語", color: "#f7df1e" },
      { id: "frontend", name: "フロントエンド", color: "#61dafb" },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    definition:
      "TypeScriptは[term:javascript]に静的型付けを追加した言語で、Microsoftによって開発されました。[term:react]プロジェクトでよく使用されます。",
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-02-20"),
    tags: [
      { id: "language", name: "言語", color: "#3178c6" },
      { id: "frontend", name: "フロントエンド", color: "#61dafb" },
    ],
  },
  {
    id: "component",
    name: "コンポーネント",
    definition:
      "コンポーネントはUIの独立した再利用可能な部分です。[term:react]では、コンポーネントはアプリケーションの構成要素となります。",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-03-01"),
    tags: [
      { id: "concept", name: "概念", color: "#9c27b0" },
      { id: "frontend", name: "フロントエンド", color: "#61dafb" },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    definition:
      "Next.jsは[term:react]フレームワークで、サーバーサイドレンダリングやその他の機能を提供します。[term:typescript]と組み合わせて使われることが多いです。",
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-02-28"),
    tags: [
      { id: "framework", name: "フレームワーク", color: "#000000" },
      { id: "frontend", name: "フロントエンド", color: "#61dafb" },
    ],
  },
];
