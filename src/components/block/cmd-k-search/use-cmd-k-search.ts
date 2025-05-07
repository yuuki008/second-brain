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

export function useCmdKSearch(setOpen: (open: boolean) => void) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allNodes, setAllNodes] = useState<(Node & { tags: Tag[] })[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [isFetchingNodes, startFetchingTransition] = useTransition();
  const [selectingNodeId, setSelectingNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    startFetchingTransition(async () => {
      try {
        const nodes = await getAllNodes();
        setAllNodes(nodes);
        if (nodes.length > 0 && !focusedNodeId) {
          setFocusedNodeId(nodes[0].id);
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        // TODO: Add user-friendly error handling (e.g., toast notification)
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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

  useEffect(() => {
    if (
      searchQuery &&
      filteredNodes.length > 0 &&
      focusedNodeId !== filteredNodes[0].id
    ) {
      setFocusedNodeId(filteredNodes[0].id);
    } else if (searchQuery && filteredNodes.length === 0) {
      setFocusedNodeId(null);
    } else if (
      !searchQuery &&
      allNodes.length > 0 &&
      focusedNodeId !== allNodes[0]?.id
    ) {
      setFocusedNodeId(allNodes[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filteredNodes, allNodes]);

  const focusedNode = useMemo(() => {
    return filteredNodes.find((node) => node.id === focusedNodeId) || null;
  }, [filteredNodes, focusedNodeId]);

  const [isCreating, startCreateTransition] = useTransition();
  const [, startSelectTransition] = useTransition();

  const handleCreateNew = useCallback(async () => {
    if (!searchQuery.trim()) return;
    startCreateTransition(async () => {
      try {
        const newNode = await createNode(searchQuery);
        setAllNodes((prev) => [newNode, ...prev]);
        router.push(`/node/${newNode.id}`);
        setSearchQuery("");
        setOpen(false);
      } catch (error) {
        console.error("新規作成エラー:", error);
        // TODO: Add user-friendly error handling
      }
    });
  }, [searchQuery, router, setOpen, startCreateTransition]);

  const handleSelectItem = useCallback(
    (nodeId: string) => {
      setSelectingNodeId(nodeId);
      startSelectTransition(() => {
        try {
          router.push(`/node/${nodeId}`);
          setSearchQuery("");
          setOpen(false);
        } catch (error) {
          console.error("選択処理エラー:", error);
          // TODO: エラーハンドリング
        } finally {
          setSelectingNodeId(null);
        }
      });
    },
    [router, setOpen, startSelectTransition]
  );

  return {
    session,
    searchQuery,
    setSearchQuery,
    allNodes,
    filteredNodes,
    focusedNodeId,
    setFocusedNodeId,
    focusedNode,
    handleCreateNew,
    handleSelectItem,
    isCreating,
    selectingNodeId,
    isFetchingNodes,
  };
}
