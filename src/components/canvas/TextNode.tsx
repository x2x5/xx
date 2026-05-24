import { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMindMapStore } from '../../hooks/useMindMapStore';
import { renderLatex } from '../../lib/latex';

export type TextNodeData = {
  content: string;
  renderMode: 'plain' | 'latex' | 'mixed';
};

export default function TextNode({ id, data, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const editingNodeId = useMindMapStore((s) => s.editingNodeId);
  const updateNode = useMindMapStore((s) => s.updateNode);
  const pushHistory = useMindMapStore((s) => s.pushHistory);
  const setEditingNodeId = useMindMapStore((s) => s.setEditingNodeId);

  const isEditing = editingNodeId === id;
  const [editValue, setEditValue] = useState(nodeData.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (isEditing) {
      setEditValue(nodeData.content);
      wasEditing.current = true;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    } else if (wasEditing.current) {
      wasEditing.current = false;
      if (editValue !== nodeData.content) {
        pushHistory();
      }
    }
  }, [isEditing]);

  const saveEdit = useCallback(() => {
    updateNode(id, {
      data: { ...nodeData, content: editValue },
    });
    setEditingNodeId(null);
  }, [id, editValue, nodeData, updateNode, setEditingNodeId]);

  const cancelEdit = useCallback(() => {
    setEditValue(nodeData.content);
    setEditingNodeId(null);
  }, [nodeData.content, setEditingNodeId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleBlur = () => {
    saveEdit();
  };

  const renderContent = () => {
    if (nodeData.renderMode === 'plain' || !nodeData.content.includes('$')) {
      return (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {nodeData.content || <span style={{ color: '#999' }}>双击编辑</span>}
        </div>
      );
    }

    const html = renderLatex(nodeData.content);
    return (
      <div
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 14,
          lineHeight: 1.5,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div
      style={{
        minWidth: 120,
        minHeight: 60,
        maxWidth: 400,
        backgroundColor: selected ? '#e3f2fd' : '#fff',
        border: selected ? '2px solid #2196f3' : '1px solid #ccc',
        borderRadius: 8,
        padding: 12,
        boxShadow: selected
          ? '0 4px 12px rgba(33,150,243,0.3)'
          : '0 2px 6px rgba(0,0,0,0.1)',
        cursor: isEditing ? 'text' : 'grab',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#2196f3', width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#2196f3', width: 8, height: 8 }}
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            width: '100%',
            minHeight: 60,
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            padding: 0,
            margin: 0,
          }}
        />
      ) : (
        renderContent()
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#2196f3', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#2196f3', width: 8, height: 8 }}
      />
    </div>
  );
}
