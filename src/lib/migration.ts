import type { MindMapFile } from '../types/mindmap';

const CURRENT_SCHEMA_VERSION = '1.0.0';

export function migrateIfNeeded(data: unknown): MindMapFile {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid file format');
  }

  const file = data as Record<string, unknown>;

  if (!file.schemaVersion) {
    throw new Error('Missing schema version');
  }

  if (file.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    console.warn(`File schema version ${file.schemaVersion} may need migration`);
  }

  return file as MindMapFile;
}

export function validateMindMapFile(file: MindMapFile): void {
  if (!file.projectId) throw new Error('Missing projectId');
  if (!file.tabs || !Array.isArray(file.tabs)) throw new Error('Missing tabs');
  if (!file.activeTabId) throw new Error('Missing activeTabId');

  for (const tab of file.tabs) {
    if (!tab.id) throw new Error('Missing tab id');
    if (!tab.nodes || !Array.isArray(tab.nodes)) throw new Error('Missing nodes');
    if (!tab.edges || !Array.isArray(tab.edges)) throw new Error('Missing edges');
  }
}
