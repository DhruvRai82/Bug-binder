export interface FSNode {
    id: string;
    project_id: string;
    parent_id: string | null;
    user_id: string;
    name: string;
    type: 'file' | 'folder';
    language?: 'typescript' | 'python' | 'java';
    content?: string; // Content might be loaded lazily or included
    created_at: string;
}

export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    language?: 'typescript' | 'python' | 'java';
    content?: string;
    children?: FileNode[];
    parentId: string | null;
}

export function buildFileTree(nodes: FSNode[]): FileNode[] {
    const nodeMap = new Map<string, FileNode>();
    const tree: FileNode[] = [];

    // 1. Create all nodes
    nodes.forEach(node => {
        nodeMap.set(node.id, {
            id: node.id,
            name: node.name,
            type: node.type,
            language: node.language,
            content: node.content,
            parentId: node.parent_id,
            children: []
        });
    });

    // 2. Build Hierarchy
    nodes.forEach(node => {
        const fileNode = nodeMap.get(node.id)!;
        if (node.parent_id && nodeMap.has(node.parent_id)) {
            const parent = nodeMap.get(node.parent_id)!;
            parent.children?.push(fileNode);
        } else {
            tree.push(fileNode);
        }
    });

    // 3. Sort (Folders first, then files)
    const sortNodes = (n: FileNode[]) => {
        n.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
        n.forEach(child => {
            if (child.children) sortNodes(child.children);
        });
    };

    sortNodes(tree);
    return tree;
}
