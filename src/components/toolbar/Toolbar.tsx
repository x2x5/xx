import {
  Save,
  FolderOpen,
  Undo,
  Redo,
  Trash2,
  LayoutGrid,
  ImagePlus,
  Maximize,
  Type,
} from 'lucide-react';
import { useMindMapStore } from '../../hooks/useMindMapStore';
import { saveMindMapFile } from '../../lib/file';

export default function Toolbar() {
  const file = useMindMapStore((s) => s.file);
  const undo = useMindMapStore((s) => s.undo);
  const redo = useMindMapStore((s) => s.redo);
  const pushHistory = useMindMapStore((s) => s.pushHistory);
  const clearCanvas = useMindMapStore((s) => s.clearCanvas);
  const autoLayout = useMindMapStore((s) => s.autoLayout);
  const loadFile = useMindMapStore((s) => s.loadFile);
  const showToast = useMindMapStore((s) => s.showToast);
  const setProjectTitle = useMindMapStore((s) => s.setProjectTitle);
  const activeTab = useMindMapStore((s) => s.getActiveTab());

  const handleSave = () => {
    try {
      saveMindMapFile(file);
      showToast('文件已保存', 'success');
    } catch {
      showToast('保存失败', 'error');
    }
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mindmap.json,.json';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const fileObj = target.files?.[0];
      if (!fileObj) return;

      try {
        const text = await fileObj.text();
        const data = JSON.parse(text);

        if (!data.schemaVersion || !data.tabs) {
          showToast('无法识别该画布文件', 'error');
          return;
        }

        loadFile(data);
        showToast('文件已加载', 'success');
      } catch {
        showToast('文件格式不正确', 'error');
      }
    };
    input.click();
  };

  const handleAutoLayout = () => {
    pushHistory();
    autoLayout('LR');
    showToast('已自动排列', 'success');
  };

  const handleClear = () => {
    if (
      !confirm('确定要清空当前画布吗？此操作不可撤销。')
    ) {
      return;
    }
    pushHistory();
    clearCanvas();
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const fileObj = target.files?.[0];
      if (!fileObj) return;

      try {
        const { fileToDataUrl } = await import('../../lib/file');
        const src = await fileToDataUrl(fileObj);
        const { useMindMapStore } = await import('../../hooks/useMindMapStore');
        const store = useMindMapStore.getState();
        const tab = store.getActiveTab();
        if (!tab) return;

        const { generateId } = await import('../../lib/id');
        const viewport = tab.viewport;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

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
            fileName: fileObj.name,
            mimeType: fileObj.type,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        showToast('图片已插入', 'success');
      } catch {
        showToast('插入图片失败', 'error');
      }
    };
    input.click();
  };

  const handleFitView = () => {
    // This will be handled by the canvas component
    window.dispatchEvent(new CustomEvent('mindmap:fitView'));
  };

  const nodeCount = activeTab?.nodes.length ?? 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
        <Type size={18} color="#2196f3" />
        <input
          type="text"
          value={file.projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 15,
            fontWeight: 600,
            outline: 'none',
            width: 180,
          }}
          title="项目名称"
        />
      </div>

      <div style={{ width: 1, height: 24, background: '#ccc', margin: '0 4px' }} />

      <ToolbarButton onClick={handleSave} title="保存 (Ctrl+S)">
        <Save size={16} />
        <span>保存</span>
      </ToolbarButton>

      <ToolbarButton onClick={handleOpen} title="打开 (Ctrl+O)">
        <FolderOpen size={16} />
        <span>打开</span>
      </ToolbarButton>

      <div style={{ width: 1, height: 24, background: '#ccc', margin: '0 4px' }} />

      <ToolbarButton onClick={undo} title="撤销 (Ctrl+Z)">
        <Undo size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={redo} title="重做 (Ctrl+Shift+Z)">
        <Redo size={16} />
      </ToolbarButton>

      <div style={{ width: 1, height: 24, background: '#ccc', margin: '0 4px' }} />

      <ToolbarButton onClick={handleClear} title="清空画布">
        <Trash2 size={16} />
        <span>清空</span>
      </ToolbarButton>

      <ToolbarButton onClick={handleAutoLayout} title="自动排列">
        <LayoutGrid size={16} />
        <span>排列</span>
      </ToolbarButton>

      <ToolbarButton onClick={handleInsertImage} title="插入图片">
        <ImagePlus size={16} />
        <span>图片</span>
      </ToolbarButton>

      <ToolbarButton onClick={handleFitView} title="适应视图">
        <Maximize size={16} />
        <span>适应</span>
      </ToolbarButton>

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: 12,
          color: '#888',
          whiteSpace: 'nowrap',
        }}
      >
        {nodeCount} 个节点
      </span>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 10px',
        border: 'none',
        borderRadius: 6,
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 13,
        color: '#444',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = '#e0e0e0')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = 'transparent')
      }
    >
      {children}
    </button>
  );
}
