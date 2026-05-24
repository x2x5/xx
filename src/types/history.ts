export type HistoryState = {
  nodes: import('./mindmap').MindMapNode[];
  edges: import('./mindmap').MindMapEdge[];
  viewport: import('./mindmap').Viewport;
};

export type History = {
  past: HistoryState[];
  present: HistoryState;
  future: HistoryState[];
};
