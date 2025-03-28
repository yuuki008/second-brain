"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
  theme: string | undefined;
}

const white = new THREE.Color(0xfafafa);
const black = new THREE.Color(0x171717);
const darkBlue = new THREE.Color(0x3b82f6);
const lightBlue = new THREE.Color(0x3b82f6);

const Node = memo(({ position, node, onHover, isActive, theme }: NodeProps) => {
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

  useFrame(() => {
    if (ref.current) {
      if (isActive) {
        // アクティブなノードは青く光る
        setGlowIntensity((prev) => Math.min(prev + 0.05, 1));
        (ref.current.material as THREE.MeshStandardMaterial).emissive.set(
          activeColor.clone().multiplyScalar(glowIntensity)
        );
        (ref.current.material as THREE.MeshStandardMaterial).color.set(
          activeColor
        );
      } else {
        // 非アクティブなノードは暗くなる
        setGlowIntensity((prev) => Math.max(prev - 0.05, 0));
        (ref.current.material as THREE.MeshStandardMaterial).emissive.set(
          new THREE.Color(0, 0, 0)
        );
        (ref.current.material as THREE.MeshStandardMaterial).color.set(
          inactiveColor
        );
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
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={isActive ? activeColor : inactiveColor}
        roughness={0.2}
        metalness={0.6}
        envMapIntensity={1.5}
      />
    </mesh>
  );
});

Node.displayName = "Node";

interface LinkProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  isActive: boolean;
  theme: string | undefined;
}

const Link = memo(({ start, end, isActive, theme }: LinkProps) => {
  const materialRef = useRef<THREE.LineBasicMaterial>(null!);

  // カラー定義
  const linkColor = useMemo(() => {
    return theme === "dark" ? white : black;
  }, [theme]);

  const activeColor = useMemo(() => {
    return theme === "dark" ? darkBlue : lightBlue;
  }, [theme]);

  const geometry = useMemo(() => {
    const points = [start, end];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isActive ? activeColor : linkColor,
      transparent: isActive ? false : true,
      opacity: isActive ? 0.8 : 0.5,
    });
  }, [isActive, activeColor, linkColor]);

  useFrame(() => {
    if (materialRef.current) {
      if (isActive) {
        materialRef.current.color.set(activeColor);
        materialRef.current.opacity = 0.8;
      } else {
        materialRef.current.color.set(linkColor);
        materialRef.current.opacity = 0.5;
      }
    }
  });

  return <primitive object={new THREE.Line(geometry, material)} />;
});

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
        <p className="text-sm text-muted-foreground mt-1">{node.content}</p>
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
          Math.random() * 16 - 8, // -8 から 8 の範囲
          Math.random() * 16 - 8,
          Math.random() * 16 - 8
        ),
      };
    });
  }, [graphData.nodes]);

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
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <hemisphereLight intensity={0.2} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />

        {nodesWithPosition.map(
          (node: NodeData & { position: THREE.Vector3 }) => (
            <Node
              key={node.id}
              node={node}
              position={node.position}
              onHover={handleNodeHover}
              isActive={
                activeNode !== null &&
                (activeNode === node.id ||
                  graphData.links.some(
                    (link: { source: string; target: string }) =>
                      (link.source === activeNode && link.target === node.id) ||
                      (link.target === activeNode && link.source === node.id)
                  ))
              }
              theme={theme}
            />
          )
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

            return (
              <Link
                key={`${link.source}-${link.target}-${index}`}
                start={startNode.position}
                end={endNode.position}
                isActive={
                  activeNode !== null &&
                  (activeNode === link.source || activeNode === link.target)
                }
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
