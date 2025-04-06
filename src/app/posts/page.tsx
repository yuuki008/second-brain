import { getAllNodes } from "@/app/actions/search";
import { Metadata } from "next";
import PostsList from "./components/posts-list";

export const metadata: Metadata = {
  title: "最近の投稿 | Second Brain",
  description: "最近更新されたノード一覧",
};

export default async function PostsPage() {
  const nodes = await getAllNodes();

  return (
    <div className="max-w-2xl mx-auto pt-20 pb-16 px-4">
      <h1 className="text-2xl font-bold mb-8">最近の投稿</h1>
      <PostsList nodes={nodes} />
    </div>
  );
}
