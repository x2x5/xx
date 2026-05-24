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
            color: nodeData.content ? '#333' : '#999',
          }}
        >
          {nodeData.content || '双击编辑'}
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
        width: 200,
        minHeight: 36,
        maxWidth: 260,
        backgroundColor: selected ? '#e3f2fd' : '#fff',
        border: selected ? '1.5px solid #2196f3' : '1px solid #ddd',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: selected
          ? '0 2px 8px rgba(33,150,243,0.2)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        cursor: isEditing ? 'text' : 'grab',
        transition: 'box-shadow 0.15s, border-color 0.15s, background-color 0.15s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: selected ? '#2196f3' : '#bbb',
          width: 6,
          height: 6,
          border: '1.5px solid #fff',
          borderRadius: '50%',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: selected ? '#2196f3' : '#bbb',
          width: 6,
          height: 6,
          border: '1.5px solid #fff',
          borderRadius: '50%',
        }}
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
            minHeight: 20,
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            padding: 0,
            margin: 0,
            color: '#333',
          }}
        />
      ) : (
        renderContent()
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: selected ? '#2196f3' : '#bbb',
          width: 6,
          height: 6,
          border: '1.5px solid #fff',
          borderRadius: '50%',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: selected ? '#2196f3' : '#bbb',
          width: 6,
          height: 6,
          border: '1.5px solid #fff',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
