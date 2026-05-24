import * as dagre from 'dagre';
import type { MindMapNode, MindMapEdge, Viewport } from '../types/mindmap';

type LayoutDirection = 'LR' | 'TB' | 'GRID';

export function layoutNodes(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  direction: LayoutDirection = 'LR'
): MindMapNode[] {
  if (direction === 'GRID') {
    return gridLayout(nodes);
  }

  if (edges.length === 0) {
    return gridLayout(nodes);
  }

  return dagreLayout(nodes, edges, direction);
}

function dagreLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  direction: 'LR' | 'TB'
): MindMapNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 20,
    marginy: 20,
  });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.size.width,
      height: node.size.height,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const layoutNode = g.node(node.id);
    if (!layoutNode) return node;

    return {
      ...node,
      position: {
        x: layoutNode.x - layoutNode.width / 2,
        y: layoutNode.y - layoutNode.height / 2,
      },
    };
  });
}

function gridLayout(nodes: MindMapNode[]): MindMapNode[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const gapX = 300;
  const gapY = 200;

  return nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...node,
      position: {
        x: col * gapX,
        y: row * gapY,
      },
    };
  });
}

export function getViewportCenter(viewport: Viewport): { x: number; y: number } {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  return {
    x: (centerX - viewport.x) / viewport.zoom,
    y: (centerY - viewport.y) / viewport.zoom,
  };
}
