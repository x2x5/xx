# Mindmap Canvas

一个运行在浏览器中的本地优先无限画布思维导图工具。

## 功能

- 无限画布 - 自由缩放和平移
- 双击创建卡片节点
- 节点编辑（支持文字、LaTeX 公式）
- 节点之间可连线
- 本地保存 / 打开（.mindmap.json 格式）
- 多标签页画布
- Undo / Redo
- 图片节点（粘贴/拖拽/上传）
- 一键自动排列
- 支持部署到 GitHub Pages

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库
2. 推送代码到 main 分支
3. GitHub Actions 会自动部署到 Pages

或者手动部署：

```bash
npm run build
npm run deploy
```

## 数据说明

所有数据默认保存在用户本地文件中，本应用不会上传任何内容到服务器。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+S / Cmd+S | 保存文件 |
| Ctrl+O / Cmd+O | 打开文件 |
| Ctrl+Z / Cmd+Z | 撤销 |
| Ctrl+Shift+Z / Cmd+Shift+Z | 重做 |
| Delete / Backspace | 删除选中内容 |
| Ctrl+A / Cmd+A | 选择全部节点 |
| Esc | 取消选择或退出编辑 |
| Ctrl+Enter | 完成节点编辑 |
| 双击空白处 | 创建新节点 |
| 双击节点 | 编辑节点 |

## 技术栈

- Vite + React + TypeScript
- XYFlow (React Flow) - 画布引擎
- Zustand - 状态管理
- Dagre - 自动布局
- KaTeX - LaTeX 公式渲染
