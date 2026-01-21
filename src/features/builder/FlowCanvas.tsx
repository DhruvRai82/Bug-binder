import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    Panel,
    NodeChange,
    applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Play, Plus, Settings, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// UI Components
import { FlowSidebar } from './components/FlowSidebar';
import { FlowContextMenu } from './components/FlowContextMenu';
import { AIGenerator } from './components/AIGenerator';

// --- Types ---
interface FlowStepParams {
    url?: string;
    selector?: string;
    value?: string;
    timeout?: number;
}

interface FlowStepData {
    label: string;
    action: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot';
    params: FlowStepParams;
}

interface ExecutionStep {
    id: string;
    action: string;
    params: any;
}

interface FlowCanvasProps {
    initialNodes?: Node<FlowStepData>[];
    initialEdges?: Edge[];
    onSave?: (nodes: Node[], edges: Edge[]) => void;
    sourcePath?: string;
}

// Default Nodes if nothing loaded
const defaultNodes: Node<FlowStepData>[] = [
    {
        id: '1',
        position: { x: 250, y: 5 },
        data: { label: 'Start Flow', action: 'navigate', params: { url: 'https://example.com' } },
        type: 'input',
        style: { background: '#fff', border: '1px solid #777', padding: 10, borderRadius: 5, width: 220 }
    },
];

export function FlowCanvas({ initialNodes = defaultNodes, initialEdges = [], onSave, sourcePath }: FlowCanvasProps) {
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    // Reset canvas when new Props come in (File Layout change)
    useEffect(() => {
        setNodes(initialNodes.length > 0 ? initialNodes : defaultNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges]);

    // Save Hook (Auto-save on change?) 
    // For now, parent triggers save or we trigger change up.
    // Let's allow manual save for now via Parent, or auto-sync.
    useEffect(() => {
        if (onSave) onSave(nodes, edges);
    }, [nodes, edges]); // Warning: This might be too frequent. Debounce needed in real app.

    const onNodesChangeHandler = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        [setNodes]
    );

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
    const [isAIOpen, setIsAIOpen] = useState(false);

    // Context Menu Handler
    const onContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            const pane = (event.target as Element).closest('.react-flow__pane');
            if (pane) {
                setMenu({ x: event.clientX, y: event.clientY });
            }
        },
        [setMenu]
    );

    const closeMenu = useCallback(() => setMenu(null), []);

    // Drag & Drop Handlers
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const action = event.dataTransfer.getData('application/action'); // Custom 'data.action'

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Get Position relative to flow
            // Note: In a real app we need reactFlowInstance.project() to map screen -> flow coords
            // For now, simpler approximation or relying on center
            const position = {
                x: event.nativeEvent.offsetX,
                y: event.nativeEvent.offsetY
            };

            addNode(action, position); // Pass custom position
        },
        [setNodes] // Dependencies
    );

    const addNode = (actionType: string, pos?: { x: number, y: number }) => {
        const id = `node-${Date.now()}`;
        let label = 'Action';
        let params: FlowStepParams = {};

        switch (actionType) {
            case 'navigate': label = 'Navigate'; params = { url: 'https://google.com' }; break;
            case 'click': label = 'Click'; params = { selector: '#submit' }; break;
            case 'type': label = 'Type'; params = { selector: '#email', value: '' }; break;
            case 'wait': label = 'Wait'; params = { value: '1000' }; break;
            case 'screenshot': label = 'Screenshot'; break;
            // New Logic Nodes
            case 'condition': label = 'If / Else'; break;
            case 'loop': label = 'Loop'; break;
            case 'assert_text': label = 'Assert Text'; params = { selector: '.success', value: 'Success' }; break;
            case 'assert_visible': label = 'Assert Visible'; params = { selector: '#modal' }; break;
        }

        const newNode: Node<FlowStepData> = {
            id,
            position: pos || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: { label, action: actionType as any, params },
            type: 'default', // or custom type if we have one
            style: {
                background: '#fff',
                border: '1px solid #e2e8f0',
                padding: '10px 15px',
                borderRadius: 8,
                width: 240,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 500
            }
        };

        setNodes((nds) => nds.concat(newNode));
    };

    const updateSelectedNode = (key: keyof FlowStepParams, value: string) => {
        if (!selectedNodeId) return;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNodeId) {
                    const newParams = { ...node.data.params, [key]: value };
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            params: newParams,
                            label: `${node.data.action} ${value ? '(' + value.substring(0, 15) + '...)' : ''}`
                        },
                    };
                }
                return node;
            })
        );
    };

    // ... (inside component)
    const [isHeadless, setIsHeadless] = useState(false);

    const handleRunFlow = async () => {
        setIsRunning(true);
        try {
            const startNode = nodes.find(n => n.type === 'input') || nodes[0];
            const linearSteps: ExecutionStep[] = [];

            let currentNode: Node | undefined = startNode;
            let loopGuard = 0;
            while (currentNode && loopGuard < 100) {
                linearSteps.push({
                    id: currentNode.id,
                    action: currentNode.data.action,
                    params: currentNode.data.params
                });

                const edge = edges.find(e => e.source === currentNode?.id);
                currentNode = edge ? nodes.find(n => n.id === edge.target) : undefined;
                loopGuard++;
            }

            toast.info(`Executing ${linearSteps.length} steps...`);
            console.log('[FlowCanvas] Running Flow with Source Path:', sourcePath);
            // Pass options: { headless: isHeadless, sourcePath }
            await api.post('/api/engine/run', {
                steps: linearSteps,
                options: { headless: isHeadless, sourcePath }
            });
            toast.success('Flow Executed Successfully!');
        } catch (error: any) {
            toast.error('Failed: ' + error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);

    return (
        <div className="flex h-full w-full bg-background text-foreground">
            {/* 1. LEFT SIDEBAR */}
            <FlowSidebar />

            <div className="flex-1 relative h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChangeHandler}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitView
                    deleteKeyCode={['Backspace', 'Delete']}
                    // Drag & Drop Handlers
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    // Context Menu
                    onContextMenu={onContextMenu}
                >
                    <Controls className="bg-background border-border" />
                    <MiniMap className="bg-background border-border" />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

                    <Panel position="top-right" className="flex items-center gap-4 bg-background/80 backdrop-blur p-2 rounded-lg border shadow-sm">
                        {/* Headless Toggle */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="headless-mode"
                                checked={isHeadless}
                                onCheckedChange={setIsHeadless}
                            />
                            <Label htmlFor="headless-mode" className="text-xs font-medium cursor-pointer">
                                Headless
                            </Label>
                        </div>

                        <div className="h-4 w-px bg-border" />

                        {/* AI Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setIsAIOpen(true)}
                        >
                            <Sparkles className="w-4 h-4" /> AI Generate
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleRunFlow}
                            disabled={isRunning}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        >
                            <Play className="w-4 h-4 mr-2" /> {isRunning ? 'Running...' : 'Run Flow'}
                        </Button>
                    </Panel>
                </ReactFlow>

                {/* Context Menu Overlay */}
                {menu && <FlowContextMenu x={menu.x} y={menu.y} onClose={closeMenu} onAddNode={addNode} />}

                {/* AI Dialog */}
                <AIGenerator
                    open={isAIOpen}
                    onOpenChange={setIsAIOpen}
                    onGenerate={(newNodes, newEdges) => {
                        setNodes(newNodes);
                        setEdges(newEdges);
                    }}
                />
            </div>

            {/* Right Panel: Properties */}
            {selectedNode && (
                <div className="w-80 bg-background border-l flex flex-col z-10 shadow-sm animate-in slide-in-from-right-10 duration-200">
                    <div className="p-4 border-b bg-muted/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold">Properties</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">ID: {selectedNode.id}</p>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Action Type</Label>
                                <Input value={selectedNode.data.action} disabled className="bg-muted capitalize font-medium" />
                            </div>
                            <Separator />
                            {/* Dynamic Inputs based on Action */}
                            {selectedNode.data.action === 'navigate' && (
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input
                                        value={selectedNode.data.params.url || ''}
                                        onChange={(e) => updateSelectedNode('url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {(selectedNode.data.action === 'click' || selectedNode.data.action === 'type') && (
                                <div className="space-y-2">
                                    <Label>CSS Selector</Label>
                                    <Input
                                        value={selectedNode.data.params.selector || ''}
                                        onChange={(e) => updateSelectedNode('selector', e.target.value)}
                                        placeholder="#submit-btn"
                                    />
                                </div>
                            )}

                            {selectedNode.data.action === 'type' && (
                                <div className="space-y-2">
                                    <Label>Text Value</Label>
                                    <Input
                                        value={selectedNode.data.params.value || ''}
                                        onChange={(e) => updateSelectedNode('value', e.target.value)}
                                        placeholder="Hello World"
                                    />
                                </div>
                            )}

                            {selectedNode.data.action === 'wait' && (
                                <div className="space-y-2">
                                    <Label>Duration (ms)</Label>
                                    <Input
                                        type="number"
                                        value={selectedNode.data.params.value || ''}
                                        onChange={(e) => updateSelectedNode('value', e.target.value)}
                                        placeholder="1000"
                                    />
                                </div>
                            )}

                            <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))}>
                                Delete Node
                            </Button>
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
