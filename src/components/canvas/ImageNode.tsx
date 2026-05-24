import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export type ImageNodeData = {
  src: string;
  fileName?: string;
  mimeType: string;
  originalWidth?: number;
  originalHeight?: number;
  alt?: string;
};

export default function ImageNode({ data, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [size, setSize] = useState({ width: 320, height: 240 });
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setSize({
        width: Math.max(100, startWidth + dx),
        height: Math.max(80, startHeight + dy),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        backgroundColor: selected ? '#e3f2fd' : '#fff',
        border: selected ? '2px solid #2196f3' : '1px solid #ccc',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: selected
          ? '0 4px 12px rgba(33,150,243,0.3)'
          : '0 2px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        cursor: isResizing ? 'se-resize' : 'grab',
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

      <img
        src={nodeData.src}
        alt={nodeData.alt || nodeData.fileName || '图片'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
        draggable={false}
      />

      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: 'se-resize',
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%)',
          borderBottomRightRadius: 6,
        }}
      />

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
