"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Stars } from "@react-three/drei";
import * as THREE from "three";
import { memo, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

// 型定義
export interface NodeData {
  id: string;
  name: string;
  content: string;
}

export type GraphData = {
  nodes: NodeData[];
  links: {
    source: string;
    target: string;
  }[];
};

interface NodeProps {
  position: THREE.Vector3;
  node: {
    id: string;
    name: string;
    content: string;
  };
  onHover: (id: string | null) => void;
  isActive: boolean;
  isHighlighted: boolean;
  theme: string | undefined;
}

const white = new THREE.Color(0xfafafa);
const black = new THREE.Color(0x171717);
const darkBlue = new THREE.Color(0x3b82f6);
const lightBlue = new THREE.Color(0x3b82f6);

const Node = memo(
  ({ position, node, onHover, isActive, isHighlighted, theme }: NodeProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const hovered = useRef(false);
    const [glowIntensity, setGlowIntensity] = useState(0);

    // カラー定義
    const activeColor = useMemo(() => {
      // CSS変数から取得するのが理想的だが、React Three Fiberの制約上直接参照できないため近似値を使用
      return theme === "dark" ? darkBlue : lightBlue;
    }, [theme]);

    const inactiveColor = useMemo(() => {
      return theme === "dark" ? white : black;
    }, [theme]);

    // 非ハイライト状態の色を定義
    const dimmedColor = useMemo(() => {
      return theme === "dark"
        ? new THREE.Color(0x444444)
        : new THREE.Color(0xbbbbbb);
    }, [theme]);

    useFrame(() => {
      if (ref.current) {
        const material = ref.current.material as THREE.MeshStandardMaterial;

        if (isActive) {
          // アクティブなノードは青く光る
          setGlowIntensity((prev) => Math.min(prev + 0.1, 1)); // 光る速度を上げる
          material.emissive.set(
            activeColor.clone().multiplyScalar(glowIntensity)
          );
          material.color.set(activeColor);
          // アクティブノードはより大きく
          ref.current.scale.set(1.2, 1.2, 1.2);
        } else if (isHighlighted) {
          setGlowIntensity((prev) => Math.min(prev + 0.1, 1));
          material.emissive.set(
            activeColor.clone().multiplyScalar(glowIntensity)
          );
          material.color.set(activeColor);
          ref.current.scale.set(1, 1, 1);
        } else {
          // 関連のないノードは暗く小さく
          setGlowIntensity((prev) => Math.max(prev - 0.05, 0));
          material.emissive.set(new THREE.Color(0, 0, 0));
          material.color.set(dimmedColor);
          ref.current.scale.setScalar(0.8);
          // 透明度も下げる
          material.transparent = true;
          material.opacity = 0.4;
        }

        // 非アクティブノードが不透明でない場合は透明度を戻す
        if ((isActive || isHighlighted) && material.transparent) {
          material.transparent = false;
          material.opacity = 1.0;
        }
      }
    });

    return (
      <mesh
        ref={ref}
        position={position}
        onPointerOver={() => {
          onHover(node.id);
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          hovered.current = false;
          document.body.style.cursor = "auto";
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={
            isActive ? activeColor : isHighlighted ? inactiveColor : dimmedColor
          }
          roughness={0.2}
          metalness={0.6}
          envMapIntensity={1.5}
          transparent={!isActive && !isHighlighted}
          opacity={!isActive && !isHighlighted ? 0.4 : 1.0}
        />
      </mesh>
    );
  }
);

Node.displayName = "Node";

interface LinkProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  isActive: boolean;
  isHighlighted: boolean;
  theme: string | undefined;
}

const Link = memo(
  ({ start, end, isActive, isHighlighted, theme }: LinkProps) => {
    // カラー定義
    const linkColor = useMemo(() => {
      return theme === "dark" ? white : black;
    }, [theme]);

    const activeColor = useMemo(() => {
      return theme === "dark" ? darkBlue : lightBlue;
    }, [theme]);

    // 非ハイライト状態の色を定義
    const dimmedColor = useMemo(() => {
      return theme === "dark"
        ? new THREE.Color(0x444444)
        : new THREE.Color(0xbbbbbb);
    }, [theme]);

    const geometry = useMemo(() => {
      const points = [start, end];
      return new THREE.BufferGeometry().setFromPoints(points);
    }, [start, end]);

    const material = useMemo(() => {
      return new THREE.LineBasicMaterial({
        color: isActive ? activeColor : isHighlighted ? linkColor : dimmedColor,
        transparent: true,
        opacity: isActive ? 1.0 : isHighlighted ? 0.8 : 0.2,
        linewidth: 1,
      });
    }, [isActive, isHighlighted, activeColor, linkColor, dimmedColor]);

    const line = useMemo(() => {
      return new THREE.Line(geometry, material);
    }, [geometry, material]);

    useFrame(() => {
      if (material) {
        if (isActive) {
          material.color.set(activeColor);
          material.opacity = 1.0;
        } else if (isHighlighted) {
          material.color.set(linkColor);
          material.opacity = 0.8;
        } else {
          material.color.set(dimmedColor);
          material.opacity = 0.2;
        }
      }
    });

    return <primitive object={line} />;
  }
);

Link.displayName = "Link";

interface NodeDetailsProps {
  node: {
    id: string;
    name: string;
    content: string;
  } | null;
}

const NodeDetails = ({ node }: NodeDetailsProps) => {
  if (!node) return null;

  return (
    <Card className="absolute bottom-4 left-4 w-72 bg-background/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium">{node.name}</h3>
      </CardContent>
    </Card>
  );
};

const NetworkGraph = ({ graphData }: { graphData: GraphData }) => {
  const { theme } = useTheme();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoveredNodeDetails, setHoveredNodeDetails] = useState<NodeData | null>(
    null
  );

  // ノードの位置を計算
  const nodesWithPosition = useMemo(() => {
    // ランダムに配置
    return graphData.nodes.map((node: NodeData) => {
      return {
        ...node,
        position: new THREE.Vector3(
          Math.random() * 14 - 7, // -7 から 7 の範囲
          Math.random() * 14 - 7,
          Math.random() * 14 - 7
        ),
      };
    });
  }, [graphData.nodes]);

  // アクティブノードに関連するノードのIDのセットを計算
  const relatedNodeIds = useMemo(() => {
    if (!activeNode) return new Set<string>();

    const relatedIds = new Set<string>();
    relatedIds.add(activeNode); // アクティブノード自体も含める

    // アクティブノードに接続されているリンクを検索
    graphData.links.forEach((link) => {
      if (link.source === activeNode) {
        relatedIds.add(link.target);
      } else if (link.target === activeNode) {
        relatedIds.add(link.source);
      }
    });

    return relatedIds;
  }, [activeNode, graphData.links]);

  const handleNodeHover = (id: string | null) => {
    setActiveNode(id);

    if (id) {
      const hoveredNode = graphData.nodes.find(
        (node: NodeData) => node.id === id
      );
      if (hoveredNode) {
        setHoveredNodeDetails(hoveredNode);
      }
    } else {
      setHoveredNodeDetails(null);
    }
  };

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        className="bg-background"
        shadows
      >
        {/* メインライト - 影を投射 */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <hemisphereLight intensity={0.2} />

        {/* 背景に星空効果を追加 */}
        <Stars
          radius={50}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* グリッドを追加 */}
        <Grid
          position={[0, -8, 0]}
          args={[32, 32]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={theme === "dark" ? "#333" : "#aaa"}
          sectionSize={4}
          sectionThickness={1}
          sectionColor={theme === "dark" ? "#444" : "#999"}
          fadeDistance={50}
          infiniteGrid
        />

        {/* 座標軸を追加 */}
        <axesHelper args={[10]} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />

        {nodesWithPosition.map(
          (node: NodeData & { position: THREE.Vector3 }) => {
            const isNodeActive = activeNode === node.id;
            const isNodeHighlighted =
              activeNode !== null && relatedNodeIds.has(node.id);

            return (
              <Node
                key={node.id}
                node={node}
                position={node.position}
                onHover={handleNodeHover}
                isActive={isNodeActive}
                isHighlighted={isNodeHighlighted && !isNodeActive}
                theme={theme}
              />
            );
          }
        )}

        {graphData.links.map(
          (link: { source: string; target: string }, index: number) => {
            const startNode = nodesWithPosition.find(
              (n: NodeData & { position: THREE.Vector3 }) =>
                n.id === link.source
            );
            const endNode = nodesWithPosition.find(
              (n: NodeData & { position: THREE.Vector3 }) =>
                n.id === link.target
            );

            if (!startNode || !endNode) return null;

            // リンクがアクティブ（ホバー中のノードに接続されている）か判定
            const isLinkActive =
              activeNode !== null &&
              ((link.source === activeNode &&
                relatedNodeIds.has(link.target)) ||
                (link.target === activeNode &&
                  relatedNodeIds.has(link.source)));

            // リンクがハイライト（関連ノード間のもの）か判定
            const isLinkHighlighted =
              activeNode !== null &&
              relatedNodeIds.has(link.source) &&
              relatedNodeIds.has(link.target);

            return (
              <Link
                key={`${link.source}-${link.target}-${index}`}
                start={startNode.position}
                end={endNode.position}
                isActive={isLinkActive}
                isHighlighted={isLinkHighlighted && !isLinkActive}
                theme={theme}
              />
            );
          }
        )}
      </Canvas>

      <NodeDetails node={hoveredNodeDetails} />
    </div>
  );
};

export default NetworkGraph;
