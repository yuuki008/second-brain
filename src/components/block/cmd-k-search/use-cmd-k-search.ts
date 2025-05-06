import {
  useState,
  useTransition,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Node, Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getAllNodes } from "@/app/actions/search";
import { createNode } from "@/app/actions/node";

export function useCmdKSearch(
  initialOpen: boolean,
  setOpen: (open: boolean) => void
) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allNodes, setAllNodes] = useState<(Node & { tags: Tag[] })[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [isFetchingNodes, startFetchingTransition] = useTransition(); // データ取得用Transition
  const [selectingNodeId, setSelectingNodeId] = useState<string | null>(null); // ★ 選択中のノードIDを保持

  // Initial data fetching
  useEffect(() => {
    if (!session) return; // セッションがない場合は何もしない
    startFetchingTransition(async () => {
      try {
        const nodes = await getAllNodes();
        setAllNodes(nodes);
        // 取得後に最初のノードをフォーカス (まだフォーカスがなければ)
        if (nodes.length > 0 && !focusedNodeId) {
          setFocusedNodeId(nodes[0].id);
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        // TODO: Add user-friendly error handling (e.g., toast notification)
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // 初回マウント時またはセッション変更時のみ実行

  // Memoized filtered nodes
  const filteredNodes = useMemo(() => {
    if (!searchQuery) {
      return allNodes;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = allNodes.filter((node) => {
      const nameMatch = node.name.toLowerCase().includes(lowerCaseQuery);
      const tagMatch = node.tags.some((tag) =>
        tag.name.toLowerCase().includes(lowerCaseQuery)
      );
      return nameMatch || tagMatch;
    });
    return results;
  }, [searchQuery, allNodes]);

  // Update focused node when filtered nodes change
  useEffect(() => {
    if (
      searchQuery &&
      filteredNodes.length > 0 &&
      focusedNodeId !== filteredNodes[0].id
    ) {
      setFocusedNodeId(filteredNodes[0].id);
    } else if (searchQuery && filteredNodes.length === 0) {
      setFocusedNodeId(null); // 検索結果がなければフォーカス解除
    } else if (
      !searchQuery &&
      allNodes.length > 0 &&
      focusedNodeId !== allNodes[0]?.id
    ) {
      // 検索クエリがクリアされたら最初のノードにフォーカスを戻す
      setFocusedNodeId(allNodes[0]?.id || null);
    }
    // We specifically don't include focusedNodeId here to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filteredNodes, allNodes]);

  // Memoized focused node derived from filtered nodes and focusedNodeId
  const focusedNode = useMemo(() => {
    return filteredNodes.find((node) => node.id === focusedNodeId) || null; // IDが一致するものだけを返す
  }, [filteredNodes, focusedNodeId]);

  // --- Action Handlers with Transitions ---
  const [isCreating, startCreateTransition] = useTransition();
  const [, startSelectTransition] = useTransition(); // ★ isSelecting は不要に

  const handleCreateNew = useCallback(async () => {
    if (!searchQuery.trim()) return; // 空のクエリでは作成しない
    startCreateTransition(async () => {
      try {
        const newNode = await createNode(searchQuery);
        // Add the new node optimistically or refetch
        setAllNodes((prev) => [newNode, ...prev]); // 新しいノードを先頭に追加
        router.push(`/node/${newNode.id}`);
        setSearchQuery(""); // Clear search query
        setOpen(false); // Close dialog
      } catch (error) {
        console.error("新規作成エラー:", error);
        // TODO: Add user-friendly error handling
      }
    });
  }, [searchQuery, router, setOpen, startCreateTransition]); // 依存関係を修正

  const handleSelectItem = useCallback(
    (nodeId: string) => {
      setSelectingNodeId(nodeId); // ★ 選択開始時にIDを設定
      startSelectTransition(() => {
        try {
          router.push(`/node/${nodeId}`);
          setSearchQuery(""); // Clear search query
          setOpen(false); // Close dialog
        } catch (error) {
          console.error("選択処理エラー:", error);
          // TODO: エラーハンドリング
        } finally {
          setSelectingNodeId(null);
        }
      });
    },
    [router, setOpen, startSelectTransition] // 依存関係を修正
  );

  return {
    session,
    searchQuery,
    setSearchQuery,
    allNodes, // <--- Add this
    filteredNodes,
    focusedNodeId,
    setFocusedNodeId,
    focusedNode, // This can be null if no node is focused or found
    handleCreateNew,
    handleSelectItem,
    isCreating,
    selectingNodeId, // ★ 追加
    isFetchingNodes, // データ取得中の状態を返す
  };
}
