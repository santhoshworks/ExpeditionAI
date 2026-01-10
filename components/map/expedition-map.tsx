"use client"

import { useCallback, useMemo, useEffect } from "react"
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
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { TrailWithCounts } from "@/types/database"
import { TrailNode } from "./trail-node"
import { cn } from "@/lib/utils"

const nodeTypes = {
  trailNode: TrailNode,
} as const

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
  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    if (trails.length === 0) {
      return { nodes: [], edges: [] }
    }

    const nodes: Node[] = []
    const edges: Edge[] = []

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

      // Position children with better spacing
      const childCount = children.length
      const spacing = mini ? 180 : 280
      const startX = x - ((childCount - 1) * spacing) / 2

      children.forEach((child, index) => {
        const childX = startX + index * spacing
        const childY = y + (mini ? 100 : 150)

        edges.push({
          id: `${trail.id}-${child.id}`,
          source: trail.id,
          target: child.id,
          type: "smoothstep",
          style: { stroke: "hsl(var(--border))", strokeWidth: 2 },
        })

        buildTree(child, childX, childY, level + 1)
      })
    }

    const startX = mini ? 150 : 400
    buildTree(baseCamp, startX, 50)

    return { nodes, edges }
  }, [trails, currentTrailId, onTrailSelect, mini])

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Update nodes and edges when trails or currentTrailId changes
  useEffect(() => {
    setNodes(computedNodes)
    setEdges(computedEdges)
  }, [computedNodes, computedEdges, setNodes, setEdges])

  if (trails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        <div className="text-center max-w-md">
          <div className="mb-4 text-6xl">🗺️</div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Your Expedition Awaits</h3>
          <p className="mb-4">
            Start exploring by chatting about a topic that interests you. Each conversation creates a trail on this map, forming a visual journey of your learning.
          </p>
          <div className="text-sm space-y-2 text-left bg-muted/30 p-4 rounded-lg">
            <p className="font-medium text-foreground">💡 Tips to get started:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Ask a question about any topic</li>
              <li>Highlight text to create a new trail</li>
              <li>Watch your knowledge map grow organically</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full h-full", mini ? "min-h-[180px]" : "min-h-[400px]")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ padding: mini ? 0.2 : 0.3 }}
        className="bg-background"
        minZoom={0.1}
        maxZoom={mini ? 0.8 : 2}
        nodesDraggable={!mini}
        nodesConnectable={false}
        elementsSelectable={!mini}
        panOnDrag={!mini}
        zoomOnScroll={!mini}
        zoomOnPinch={!mini}
        zoomOnDoubleClick={!mini}
      >
        {!mini && (
          <>
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) =>
                node.data?.isActive ? "hsl(var(--primary))" : "hsl(var(--muted))"
              }
              maskColor="hsl(var(--background) / 0.8)"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </>
        )}
      </ReactFlow>
    </div>
  )
}
