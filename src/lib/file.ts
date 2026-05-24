import type { MindMapFile } from '../types/mindmap';

export function saveMindMapFile(file: MindMapFile): void {
  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.projectTitle || 'mindmap'}.mindmap.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export async function loadMindMapFile(file: File): Promise<MindMapFile> {
  const text = await file.text();
  const data = JSON.parse(text);
  return data as MindMapFile;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
