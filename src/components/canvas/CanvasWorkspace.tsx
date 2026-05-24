import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMindMapStore } from '../../hooks/useMindMapStore';
import { generateId } from '../../lib/id';
import { saveMindMapFile } from '../../lib/file';
import type { MindMapEdge, Viewport } from '../../types/mindmap';
import TextNode from './TextNode';
import ImageNode from './ImageNode';

const nodeTypes = {
  text: TextNode,
  image: ImageNode,
};

function CanvasInner() {
  const {
    editingNodeId,
    updateNode,
    deleteNodes,
    createEdge,
    deleteEdges,
    setSelectedNodeIds,
    setSelectedEdgeIds,
    pushHistory,
    setEditingNodeId,
    updateTabViewport,
    showToast,
    getActiveTab,
  } = useMindMapStore();

  const activeTab = getActiveTab();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition, fitView, setViewport } = useReactFlow();
  const isDragging = useRef(false);
  const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});
  const lastClickRef = useRef<{ time: number; x: number; y: number } | null>(null);

  // Sync store nodes/edges to ReactFlow
  useEffect(() => {
    if (!activeTab) return;

    const flowNodes: Node[] = activeTab.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      selected: false,
    }));

    const flowEdges: Edge[] = activeTab.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: e.type === 'straight' ? 'default' : e.type,
      label: e.label,
      style: {
        stroke: e.style?.strokeColor || '#888',
        strokeWidth: e.style?.strokeWidth || 2,
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: e.style?.strokeColor || '#888',
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);

    // Restore viewport
    if (activeTab.viewport) {
      setViewport(activeTab.viewport, { duration: 0 });
    }
  }, [activeTab?.id, activeTab?.viewport.x, activeTab?.viewport.y, activeTab?.viewport.zoom]);

  // Handle fit view event
  useEffect(() => {
    const handler = () => {
      fitView({ padding: 0.2, duration: 300 });
    };
    window.addEventListener('mindmap:fitView' as any, handler);
    return () => window.removeEventListener('mindmap:fitView' as any, handler);
  }, [fitView]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const edge: MindMapEdge = {
        id: generateId('edge'),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createEdge(edge);
      pushHistory();

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: edge.id,
            markerEnd: { type: 'arrowclosed', color: '#888' },
          },
          eds
        )
      );
    },
    [createEdge, pushHistory, setEdges]
  );

  const onNodeDragStart = useCallback(() => {
    isDragging.current = true;
    dragStartPositions.current = {};
    activeTab?.nodes.forEach((n) => {
      dragStartPositions.current[n.id] = { ...n.position };
    });
  }, [activeTab]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      isDragging.current = false;
      updateNode(node.id, {
        position: { x: node.position.x, y: node.position.y },
      });
      pushHistory();
    },
    [updateNode, pushHistory]
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deleteNodes(deletedNodes.map((n) => n.id));
      pushHistory();
    },
    [deleteNodes, pushHistory]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deleteEdges(deletedEdges.map((e) => e.id));
      pushHistory();
    },
    [deleteEdges, pushHistory]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodeIds(selectedNodes.map((n) => n.id));
      setSelectedEdgeIds(selectedEdges.map((e) => e.id));
    },
    [setSelectedNodeIds, setSelectedEdgeIds]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'text') {
        setEditingNodeId(node.id);
      }
    },
    [setEditingNodeId]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now();
      const x = event.clientX;
      const y = event.clientY;

      if (
        lastClickRef.current &&
        now - lastClickRef.current.time < 350
      ) {
        const dx = Math.abs(x - lastClickRef.current.x);
        const dy = Math.abs(y - lastClickRef.current.y);
        if (dx < 10 && dy < 10) {
          lastClickRef.current = null;

          if (editingNodeId) {
            setEditingNodeId(null);
            return;
          }

          const position = screenToFlowPosition({ x, y });

          const store = useMindMapStore.getState();
          store.pushHistory();
          store.createNode({
            id: generateId('node'),
            type: 'text',
            position,
            size: { width: 200, height: 36 },
            data: { content: '', renderMode: 'mixed' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return;
        }
      }

      lastClickRef.current = { time: now, x, y };
      if (editingNodeId) {
        setEditingNodeId(null);
      }
    },
    [editingNodeId, screenToFlowPosition, setEditingNodeId]
  );

  const onViewportChange = useCallback(
    (viewport: Viewport) => {
      if (activeTab) {
        updateTabViewport(activeTab.id, viewport);
      }
    },
    [activeTab, updateTabViewport]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) {
        // Only allow Escape to exit editing mode
        if (e.key === 'Escape') {
          e.preventDefault();
          setEditingNodeId(null);
        }
        return;
      }

      const hasCtrl = e.ctrlKey || e.metaKey;

      // Save: Ctrl/Cmd + S
      if (hasCtrl && e.key === 's') {
        e.preventDefault();
        const store = useMindMapStore.getState();
        try {
          saveMindMapFile(store.file);
          store.showToast('文件已保存', 'success');
        } catch {
          store.showToast('保存失败', 'error');
        }
        return;
      }

      // Open: Ctrl/Cmd + O
      if (hasCtrl && e.key === 'o') {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mindmap.json,.json';
        input.onchange = async (ev) => {
          const target = ev.target as HTMLInputElement;
          const fileObj = target.files?.[0];
          if (!fileObj) return;
          try {
            const text = await fileObj.text();
            const data = JSON.parse(text);
            if (!data.schemaVersion || !data.tabs) {
              useMindMapStore.getState().showToast('无法识别该画布文件', 'error');
              return;
            }
            useMindMapStore.getState().loadFile(data);
            useMindMapStore.getState().showToast('文件已加载', 'success');
          } catch {
            useMindMapStore.getState().showToast('文件格式不正确', 'error');
          }
        };
        input.click();
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (hasCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useMindMapStore.getState().undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z  or  Ctrl/Cmd + Y
      if ((hasCtrl && e.key === 'z' && e.shiftKey) || (hasCtrl && e.key === 'y')) {
        e.preventDefault();
        useMindMapStore.getState().redo();
        return;
      }

      // Select All: Ctrl/Cmd + A
      if (hasCtrl && e.key === 'a') {
        e.preventDefault();
        const store = useMindMapStore.getState();
        const tab = store.getActiveTab();
        if (tab) {
          store.setSelectedNodeIds(tab.nodes.map((n) => n.id));
        }
        return;
      }

      // Delete selected nodes/edges
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const store = useMindMapStore.getState();
        if (store.selectedNodeIds.length > 0) {
          store.pushHistory();
          store.deleteNodes(store.selectedNodeIds);
        }
        if (store.selectedEdgeIds.length > 0) {
          store.pushHistory();
          store.deleteEdges(store.selectedEdgeIds);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNodeId, setEditingNodeId]);

  // Paste handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (editingNodeId) return;

      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));

      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      e.preventDefault();

      try {
        const { fileToDataUrl } = await import('../../lib/file');
        const src = await fileToDataUrl(file);

        const store = useMindMapStore.getState();
        const tab = store.getActiveTab();
        if (!tab) return;

        const viewport = tab.viewport;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        store.pushHistory();
        store.createNode({
          id: generateId('node'),
          type: 'image',
          position: {
            x: (centerX - viewport.x) / viewport.zoom - 160,
            y: (centerY - viewport.y) / viewport.zoom - 120,
          },
          size: { width: 320, height: 240 },
          data: {
            src,
            fileName: file.name,
            mimeType: file.type,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        showToast('图片已粘贴', 'success');
      } catch {
        showToast('粘贴图片失败', 'error');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingNodeId, showToast]);

  // Drop handler for image files
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (editingNodeId) return;

      const files = Array.from(e.dataTransfer?.files || []);
      const imageFile = files.find((f) => f.type.startsWith('image/'));
      if (!imageFile) return;

      try {
        const { fileToDataUrl } = await import('../../lib/file');
        const src = await fileToDataUrl(imageFile);

        const store = useMindMapStore.getState();
        const tab = store.getActiveTab();
        if (!tab) return;

        const position = screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        });

        store.pushHistory();
        store.createNode({
          id: generateId('node'),
          type: 'image',
          position: {
            x: position.x - 160,
            y: position.y - 120,
          },
          size: { width: 320, height: 240 },
          data: {
            src,
            fileName: imageFile.name,
            mimeType: imageFile.type,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        showToast('图片已插入', 'success');
      } catch {
        showToast('插入图片失败', 'error');
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [editingNodeId, screenToFlowPosition, showToast]);

  if (!activeTab) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onSelectionChange={onSelectionChange}
      onPaneClick={onPaneClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onViewportChange={onViewportChange}
      nodeTypes={nodeTypes}
      attributionPosition="bottom-right"
      deleteKeyCode={null}
      multiSelectionKeyCode="Shift"
      selectionKeyCode={null}
    >
      <Background gap={16} size={1} color="#e0e0e0" />
      <Controls />
      <Panel position="bottom-right" style={{ fontSize: 12, color: '#888' }}>
        双击空白处创建节点
      </Panel>
    </ReactFlow>
  );
}

export default function CanvasWorkspace() {
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
