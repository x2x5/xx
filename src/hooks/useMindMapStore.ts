import { create } from 'zustand';
import type {
  MindMapFile,
  MindMapTab,
  MindMapNode,
  MindMapEdge,
  Viewport,
  HistoryState,
} from '../types/mindmap';
import { generateId } from '../lib/id';
import { layoutNodes } from '../lib/layout';

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

function createDefaultTab(): MindMapTab {
  const now = new Date().toISOString();
  return {
    id: generateId('tab'),
    title: '画布 1',
    nodes: [],
    edges: [],
    viewport: { ...DEFAULT_VIEWPORT },
    createdAt: now,
    updatedAt: now,
  };
}

function createDefaultFile(): MindMapFile {
  const now = new Date().toISOString();
  const tab = createDefaultTab();
  return {
    schemaVersion: '1.0.0',
    appVersion: '0.1.0',
    projectId: generateId('project'),
    projectTitle: '我的思维导图',
    activeTabId: tab.id,
    tabs: [tab],
    settings: {
      theme: 'light',
      defaultNodeWidth: 220,
      defaultNodeHeight: 120,
      autoSaveDraft: true,
      showMiniMap: false,
      showGrid: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export type TabHistory = {
  past: HistoryState[];
  present: HistoryState;
  future: HistoryState[];
};

type MindMapStore = {
  file: MindMapFile;
  histories: Record<string, TabHistory>;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  editingNodeId: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  createTab: () => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  setActiveTab: (id: string) => void;
  updateTabViewport: (id: string, viewport: Viewport) => void;

  createNode: (node: MindMapNode) => void;
  updateNode: (id: string, updates: Partial<MindMapNode>) => void;
  deleteNodes: (ids: string[]) => void;
  setEditingNodeId: (id: string | null) => void;

  createEdge: (edge: MindMapEdge) => void;
  deleteEdges: (ids: string[]) => void;

  setSelectedNodeIds: (ids: string[]) => void;
  setSelectedEdgeIds: (ids: string[]) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  clearCanvas: () => void;
  autoLayout: (direction?: 'LR' | 'TB' | 'GRID') => void;

  loadFile: (file: MindMapFile) => void;
  setProjectTitle: (title: string) => void;

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  getActiveTab: () => MindMapTab | undefined;
  getActiveHistory: () => TabHistory | undefined;
};

function getTabHistory(tab: MindMapTab): TabHistory {
  const present: HistoryState = {
    nodes: JSON.parse(JSON.stringify(tab.nodes)),
    edges: JSON.parse(JSON.stringify(tab.edges)),
    viewport: { ...tab.viewport },
  };
  return {
    past: [],
    present,
    future: [],
  };
}

const defaultFile = createDefaultFile();

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  file: defaultFile,
  histories: { [defaultFile.tabs[0].id]: getTabHistory(defaultFile.tabs[0]) },
  selectedNodeIds: [],
  selectedEdgeIds: [],
  editingNodeId: null,
  toast: null,

  getActiveTab: () => {
    const { file } = get();
    return file.tabs.find((t) => t.id === file.activeTabId);
  },

  getActiveHistory: () => {
    const { file, histories } = get();
    return histories[file.activeTabId];
  },

  createTab: () =>
    set((state) => {
      const newTab = createDefaultTab();
      newTab.title = `画布 ${state.file.tabs.length + 1}`;
      return {
        file: {
          ...state.file,
          tabs: [...state.file.tabs, newTab],
          activeTabId: newTab.id,
        },
      };
    }),

  closeTab: (id) =>
    set((state) => {
      if (state.file.tabs.length <= 1) {
        const tab = state.file.tabs[0];
        const clearedTab = { ...tab, nodes: [], edges: [], updatedAt: new Date().toISOString() };
        return {
          file: { ...state.file, tabs: [clearedTab] },
          histories: {
            ...state.histories,
            [tab.id]: getTabHistory(clearedTab),
          },
        };
      }

      const newTabs = state.file.tabs.filter((t) => t.id !== id);
      const newActiveId =
        state.file.activeTabId === id
          ? newTabs[newTabs.length - 1].id
          : state.file.activeTabId;

      const newHistories = { ...state.histories };
      delete newHistories[id];

      return {
        file: { ...state.file, tabs: newTabs, activeTabId: newActiveId },
        histories: newHistories,
      };
    }),

  renameTab: (id, title) =>
    set((state) => ({
      file: {
        ...state.file,
        tabs: state.file.tabs.map((t) =>
          t.id === id ? { ...t, title, updatedAt: new Date().toISOString() } : t
        ),
      },
    })),

  setActiveTab: (id) =>
    set((state) => ({
      file: { ...state.file, activeTabId: id },
      selectedNodeIds: [],
      selectedEdgeIds: [],
      editingNodeId: null,
    })),

  updateTabViewport: (id, viewport) =>
    set((state) => ({
      file: {
        ...state.file,
        tabs: state.file.tabs.map((t) =>
          t.id === id ? { ...t, viewport: { ...viewport } } : t
        ),
      },
    })),

  createNode: (node) =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const newTab = {
        ...tab,
        nodes: [...tab.nodes, node],
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
        selectedNodeIds: [node.id],
        selectedEdgeIds: [],
        editingNodeId: node.id,
      };
    }),

  updateNode: (id, updates) =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const newTab = {
        ...tab,
        nodes: tab.nodes.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n
        ),
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
      };
    }),

  deleteNodes: (ids) =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const idSet = new Set(ids);
      const newTab = {
        ...tab,
        nodes: tab.nodes.filter((n) => !idSet.has(n.id)),
        edges: tab.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }),

  setEditingNodeId: (id) => set({ editingNodeId: id }),

  createEdge: (edge) =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const exists = tab.edges.some(
        (e) => e.source === edge.source && e.target === edge.target
      );
      if (exists) return state;

      const newTab = {
        ...tab,
        edges: [...tab.edges, edge],
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
      };
    }),

  deleteEdges: (ids) =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const idSet = new Set(ids);
      const newTab = {
        ...tab,
        edges: tab.edges.filter((e) => !idSet.has(e.id)),
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
        selectedEdgeIds: [],
      };
    }),

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setSelectedEdgeIds: (ids) => set({ selectedEdgeIds: ids }),

  pushHistory: () =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const present: HistoryState = {
        nodes: JSON.parse(JSON.stringify(tab.nodes)),
        edges: JSON.parse(JSON.stringify(tab.edges)),
        viewport: { ...tab.viewport },
      };

      const existing = state.histories[tab.id];
      const past = existing ? [...existing.past, existing.present] : [];
      const trimmedPast = past.slice(-50);

      return {
        histories: {
          ...state.histories,
          [tab.id]: {
            past: trimmedPast,
            present,
            future: [],
          },
        },
      };
    }),

  undo: () =>
    set((state) => {
      const history = state.histories[state.file.activeTabId];
      if (!history || history.past.length === 0) return state;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      const newFuture = [history.present, ...history.future];

      const tabId = state.file.activeTabId;

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  nodes: JSON.parse(JSON.stringify(previous.nodes)),
                  edges: JSON.parse(JSON.stringify(previous.edges)),
                  viewport: { ...previous.viewport },
                }
              : t
          ),
        },
        histories: {
          ...state.histories,
          [tabId]: {
            past: newPast,
            present: previous,
            future: newFuture,
          },
        },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }),

  redo: () =>
    set((state) => {
      const history = state.histories[state.file.activeTabId];
      if (!history || history.future.length === 0) return state;

      const next = history.future[0];
      const newFuture = history.future.slice(1);
      const newPast = [...history.past, history.present];

      const tabId = state.file.activeTabId;

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  nodes: JSON.parse(JSON.stringify(next.nodes)),
                  edges: JSON.parse(JSON.stringify(next.edges)),
                  viewport: { ...next.viewport },
                }
              : t
          ),
        },
        histories: {
          ...state.histories,
          [tabId]: {
            past: newPast,
            present: next,
            future: newFuture,
          },
        },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }),

  clearCanvas: () =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab) return state;

      const newTab = {
        ...tab,
        nodes: [],
        edges: [],
        viewport: { ...DEFAULT_VIEWPORT },
        updatedAt: new Date().toISOString(),
      };

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) => (t.id === tab.id ? newTab : t)),
        },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }),

  autoLayout: (direction = 'LR') =>
    set((state) => {
      const tab = state.file.tabs.find((t) => t.id === state.file.activeTabId);
      if (!tab || tab.nodes.length === 0) return state;

      const newNodes = layoutNodes(tab.nodes, tab.edges, direction);

      return {
        file: {
          ...state.file,
          tabs: state.file.tabs.map((t) =>
            t.id === tab.id
              ? { ...t, nodes: newNodes, updatedAt: new Date().toISOString() }
              : t
          ),
        },
      };
    }),

  loadFile: (file) =>
    set(() => {
      const histories: Record<string, TabHistory> = {};
      for (const tab of file.tabs) {
        histories[tab.id] = getTabHistory(tab);
      }
      return {
        file,
        histories,
        selectedNodeIds: [],
        selectedEdgeIds: [],
        editingNodeId: null,
      };
    }),

  setProjectTitle: (title) =>
    set((state) => ({
      file: { ...state.file, projectTitle: title },
    })),

  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
