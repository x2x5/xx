export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type NodeStyle = {
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  fontSize?: number;
};

export type TextNodeData = {
  content: string;
  renderMode: 'plain' | 'latex' | 'mixed';
};

export type ImageNodeData = {
  src: string;
  fileName?: string;
  mimeType: string;
  originalWidth?: number;
  originalHeight?: number;
  alt?: string;
};

export type GroupNodeData = {
  label: string;
};

export type MindMapNode = {
  id: string;
  type: 'text' | 'image' | 'group';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  data: TextNodeData | ImageNodeData | GroupNodeData;
  style?: NodeStyle;
  createdAt: string;
  updatedAt: string;
};

export type EdgeStyle = {
  strokeColor?: string;
  strokeWidth?: number;
};

export type MindMapEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: 'default' | 'smoothstep' | 'straight';
  label?: string;
  style?: EdgeStyle;
  createdAt: string;
  updatedAt: string;
};

export type MindMapTab = {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSettings = {
  theme: 'light' | 'dark' | 'system';
  defaultNodeWidth: number;
  defaultNodeHeight: number;
  autoSaveDraft: boolean;
  showMiniMap: boolean;
  showGrid: boolean;
};

export type MindMapFile = {
  schemaVersion: string;
  appVersion: string;
  projectId: string;
  projectTitle: string;
  activeTabId: string;
  tabs: MindMapTab[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
};

export type HistoryState = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
};

export type History = {
  past: HistoryState[];
  present: HistoryState;
  future: HistoryState[];
};
