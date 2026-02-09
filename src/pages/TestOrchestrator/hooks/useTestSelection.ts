/**
 * Module: useTestSelection
 * Purpose: Manages test file selection state and recursive selection logic
 * Why: Separates selection logic from UI for better testability and reusability
 * Performance: Uses Set for O(1) lookups, memoization to prevent unnecessary re-renders
 */

import { useState, useCallback, useMemo } from 'react';
import { FileNode } from '../types';

export function useTestSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /**
   * What: Toggles a file/folder selection (includes all descendants)
   * Why: Users need to select folders which auto-selects all children
   * How: Recursively collects all descendant IDs and updates the Set
   */
  const toggleSelection = useCallback((id: string, checked: boolean, fileSystem: FileNode[]) => {
    const getDescendantIds = (nodeId: string, nodes: FileNode[]): string[] => {
      const ids: string[] = [];
      const find = (currentId: string, currentNodes: FileNode[])=> {
        for (const node of currentNodes) {
          if (node.id === currentId) {
            ids.push(node.id);
            if (node.children) {
              const collectAll = (n: FileNode) => {
                ids.push(n.id);
                if (n.children) n.children.forEach(collectAll);
              };
              node.children.forEach(collectAll);
            }
            return true;
          }
          if (node.children && find(currentId, node.children)) return true;
        }
        return false;
      };
      find(nodeId, nodes);
      return ids;
    };

    const targetIds = getDescendantIds(id, fileSystem);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      targetIds.forEach(targetId => {
        if (checked) newSet.add(targetId);
        else newSet.delete(targetId);
      });
      return newSet;
    });
  }, []);

  /**
   * What: Loads a saved suite's file IDs into selection
   * Why: Users want to quickly run saved test suites
   */
  const loadSuite = useCallback((fileIds: string[]) => {
    setSelectedIds(new Set(fileIds));
  }, []);

  /**
   * What: Clears all selections
   * Why: Users need a quick way to reset their queue
   */
  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * What: Returns count of selected FILES (not folders)
   * Why: We only execute files, folders are just for organization
   * How: Traverses tree counting only file nodes in selectedIds
   */
  const getSelectedFileCount = useCallback((nodes: FileNode[]): number => {
    let count = 0;
    const traverse = (list: FileNode[]) => {
      for (const node of list) {
        if (selectedIds.has(node.id) && node.type === 'file') count++;
        if (node.children) traverse(node.children);
      }
    };
    traverse(nodes);
    return count;
  }, [selectedIds]);

  /**
   * What: Returns flattened list of selected file nodes
   * Why: For display in execution queue
   */
  const getSelectedFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    const list: FileNode[] = [];
    const traverse = (n: FileNode) => {
      if (selectedIds.has(n.id) && n.type === 'file') list.push(n);
      if (n.children) n.children.forEach(traverse);
    };
    nodes.forEach(traverse);
    return list;
  }, [selectedIds]);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    loadSuite,
    clearAll,
    getSelectedFileCount,
    getSelectedFiles
  };
}
