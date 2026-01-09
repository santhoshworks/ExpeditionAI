"use client"

import { useCallback, useMemo } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { TrailWithCounts } from "@/types/database"
import { TrailNode } from "./trail-node"

const nodeTypes = {
  trailNode: TrailNode,
}

interface ExpeditionMapProps {
  trails: TrailWithCounts[]
  currentTrailId?: string
  onTrailSelect?: (trailId: string) => void
  mini?: boolean
}

export function ExpeditionMap({
  trails,
  currentTrailId,
  onTrailSelect,
  mini = false,
}: ExpeditionMapProps) {
  // Build nodes and edges from trails
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (trails.length === 0) {
      return { nodes: [], edges: [] }
    }

    const nodes: Node[] = []
    const edges: Edge[] = []
    const trailMap = new Map(trails.map((t) => [t.id, t]))

    // Find base camp (root)
    const baseCamp = trails.find((t) => t.is_base_camp) || trails[0]

    // Build tree structure with positions
    const buildTree = (
      trail: TrailWithCounts,
      x: number,
      y: number,
      level: number = 0
    ): void => {
      const isActive = trail.id === currentTrailId
      const children = trails.filter((t) => t.parent_trail_id === trail.id)

      nodes.push({
        id: trail.id,
        type: "trailNode",
        position: { x, y },
        data: {
          trail,
          isActive,
          isFlagged: trail.is_flagged,
          messageCount: trail.message_count || 0,
          onClick: () => onTrailSelect?.(trail.id),
        },
      })

      // Position children
      const childCount = children.length
      const startX = x - (childCount - 1) * 150
      
      children.forEach((child, index) => {
        const childX = startX + index * 300
        const childY = y + 150

        edges.push({
          id: `${trail.id}-${child.id}`,
          source: trail.id,
          target: child.id,
          type: "smoothstep",
        })

        buildTree(child, childX, childY, level + 1)
      })
    }

    buildTree(baseCamp, 400, 50)

    return { nodes, edges }
  }, [trails, currentTrailId, onTrailSelect])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Update nodes when trails or currentTrailId changes
  const trailMap = useMemo(() => new Map(trails.map((t) => [t.id, t])), [trails])

  useMemo(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const trail = trailMap.get(node.id)
        return {
          ...node,
          data: {
            ...node.data,
            isActive: node.id === currentTrailId,
            trail,
            isFlagged: trail?.is_flagged || false,
            messageCount: trail?.message_count || 0,
            onClick: () => onTrailSelect?.(node.id),
          },
        }
      })
    )
  }, [currentTrailId, trailMap, setNodes, onTrailSelect])

  if (trails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <p>No trails to display</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        {!mini && (
          <>
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </>
        )}
      </ReactFlow>
    </div>
  )
}
