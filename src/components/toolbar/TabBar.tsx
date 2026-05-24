import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useMindMapStore } from '../../hooks/useMindMapStore';

export default function TabBar() {
  const file = useMindMapStore((s) => s.file);
  const createTab = useMindMapStore((s) => s.createTab);
  const closeTab = useMindMapStore((s) => s.closeTab);
  const setActiveTab = useMindMapStore((s) => s.setActiveTab);
  const renameTab = useMindMapStore((s) => s.renameTab);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleDoubleClick = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditValue(currentTitle);
  };

  const handleRenameSubmit = (tabId: string) => {
    if (editValue.trim()) {
      renameTab(tabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#e8e8e8',
        borderBottom: '1px solid #ccc',
        padding: '0 8px',
        gap: 2,
      }}
    >
      {file.tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id, tab.title)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor:
              file.activeTabId === tab.id ? '#fff' : 'transparent',
            borderTop:
              file.activeTabId === tab.id
                ? '2px solid #2196f3'
                : '2px solid transparent',
            borderLeft: '1px solid transparent',
            borderRight: '1px solid transparent',
            borderBottom:
              file.activeTabId === tab.id
                ? '1px solid #fff'
                : '1px solid transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: file.activeTabId === tab.id ? '#333' : '#666',
            marginBottom: -1,
            minWidth: 100,
            maxWidth: 180,
            position: 'relative',
            top: 1,
          }}
        >
          {editingTabId === tab.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRenameSubmit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit(tab.id);
                if (e.key === 'Escape') setEditingTabId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                border: '1px solid #2196f3',
                borderRadius: 3,
                padding: '2px 4px',
                fontSize: 13,
                outline: 'none',
                width: 100,
              }}
            />
          ) : (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {tab.title}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 2,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')
            }
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')
            }
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={createTab}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          color: '#666',
        }}
        title="新建画布"
        onMouseEnter={(e) => (e.currentTarget.style.background = '#ddd')
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')
        }
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
