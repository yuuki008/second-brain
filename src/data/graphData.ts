import { HierarchicalTag } from "@/app/components/TagFilter";

// タグIDから対応するタグオブジェクトを取得する関数
export const getTagById = (
  tags: HierarchicalTag[],
  id: string
): HierarchicalTag | undefined => {
  const flattenTags = (tags: HierarchicalTag[]): HierarchicalTag[] => {
    let result: HierarchicalTag[] = [];
    for (const tag of tags) {
      result.push(tag);
      if (tag.children && tag.children.length > 0) {
        result = [...result, ...flattenTags(tag.children)];
      }
    }
    return result;
  };

  const flatTags = flattenTags(tags);
  return flatTags.find((tag) => tag.id === id);
};

// グラフデータを生成する関数
export const generateGraphData = (tags: HierarchicalTag[]) => {
  // 技術用語の配列
  const techTerms = [
    "React",
    "Angular",
    "Vue.js",
    "Next.js",
    "Nuxt.js",
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "C#",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "PHP",
    "Ruby",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "ASP.NET",
    "Laravel",
    "Ruby on Rails",
    "FastAPI",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "Redis",
    "GraphQL",
    "REST API",
    "gRPC",
    "WebSockets",
    "HTTP/3",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitHub Actions",
    "CircleCI",
    "Redux",
    "Vuex",
    "Recoil",
    "MobX",
    "Zustand",
    "Tailwind CSS",
    "Bootstrap",
    "Material UI",
    "Chakra UI",
    "Ant Design",
    "Jest",
    "Mocha",
    "Cypress",
    "Puppeteer",
    "Playwright",
    "Webpack",
    "Vite",
    "Rollup",
    "Parcel",
    "esbuild",
    "React Native",
    "Flutter",
    "Xamarin",
    "Electron",
    "Tauri",
    "WebAssembly",
    "PWA",
    "SSR",
    "SSG",
    "ISR",
    "Linux",
    "macOS",
    "Windows",
    "iOS",
    "Android",
    "Git",
    "SVN",
    "Mercurial",
    "npm",
    "Yarn",
    "Babel",
    "ESLint",
    "Prettier",
    "TypeDoc",
    "Storybook",
    "Three.js",
    "D3.js",
    "Chart.js",
    "Leaflet",
    "Mapbox",
  ];

  // タグの組み合わせを定義
  const tagCombinations = [
    // フロントエンド系
    [["tag2"], ["tag3"]], // フロントエンド + ライブラリ
    [["tag2"], ["tag4"]], // フロントエンド + フレームワーク
    [["tag2"], ["tag5"]], // フロントエンド + UI
    [["tag2"], ["tag3"], ["tag5"]], // フロントエンド + ライブラリ + UI
    [["tag2"], ["tag4"], ["tag5"]], // フロントエンド + フレームワーク + UI

    // バックエンド系
    [["tag6"], ["tag7"]], // バックエンド + ランタイム
    [["tag6"], ["tag8"]], // バックエンド + 言語

    // 言語系
    [["tag8"], ["tag9"]], // 言語 + 型システム
    [["tag8"], ["tag10"]], // 言語 + Web
    [["tag8"], ["tag2"], ["tag10"]], // 言語 + フロントエンド + Web

    // 複合系
    [["tag2"], ["tag6"]], // フロントエンド + バックエンド
    [["tag2"], ["tag8"]], // フロントエンド + 言語
    [["tag6"], ["tag2"], ["tag8"]], // バックエンド + フロントエンド + 言語
  ];

  // ノードの生成
  const nodes = techTerms.map((term, index) => {
    // タグの組み合わせをランダムに選択
    const randomTagCombo =
      tagCombinations[Math.floor(Math.random() * tagCombinations.length)];
    // 選択したタグIDをオブジェクトに変換
    const nodeTags = randomTagCombo.map((tagIdArray) => {
      const tagId = tagIdArray[0];
      const tag = getTagById(tags, tagId);
      return tag!;
    });

    return {
      id: String(index + 1),
      name: term,
      tags: nodeTags,
    };
  });

  // リンクの生成
  const links = [];
  const maxLinks = 200; // 作成するリンクの最大数
  const nodeCount = nodes.length;

  // ランダムにリンクを生成
  for (let i = 0; i < maxLinks; i++) {
    const source = Math.floor(Math.random() * nodeCount) + 1;
    let target = Math.floor(Math.random() * nodeCount) + 1;

    // 自己参照を避ける
    while (target === source) {
      target = Math.floor(Math.random() * nodeCount) + 1;
    }

    links.push({
      source: String(source),
      target: String(target),
    });
  }

  return { nodes, links };
};

// タグデータ（この部分は必要に応じてページコンポーネントから渡すようにもできます）
export const tagData: HierarchicalTag[] = [
  {
    id: "tag1",
    name: "プログラミング",
    color: "#3B82F6",
    parentId: null,
    children: [
      {
        id: "tag2",
        name: "フロントエンド",
        color: "#60A5FA",
        parentId: "tag1",
        children: [
          {
            id: "tag3",
            name: "ライブラリ",
            color: "#93C5FD",
            parentId: "tag2",
            children: [],
          },
          {
            id: "tag4",
            name: "フレームワーク",
            color: "#BFDBFE",
            parentId: "tag2",
            children: [],
          },
          {
            id: "tag5",
            name: "UI",
            color: "#DBEAFE",
            parentId: "tag2",
            children: [],
          },
        ],
      },
      {
        id: "tag6",
        name: "バックエンド",
        color: "#34D399",
        parentId: "tag1",
        children: [
          {
            id: "tag7",
            name: "ランタイム",
            color: "#6EE7B7",
            parentId: "tag6",
            children: [],
          },
        ],
      },
      {
        id: "tag8",
        name: "言語",
        color: "#F59E0B",
        parentId: "tag1",
        children: [
          {
            id: "tag9",
            name: "型システム",
            color: "#FBBF24",
            parentId: "tag8",
            children: [],
          },
          {
            id: "tag10",
            name: "Web",
            color: "#FCD34D",
            parentId: "tag8",
            children: [],
          },
        ],
      },
    ],
  },
];
