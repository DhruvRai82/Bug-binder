import React, { useState, useEffect } from 'react';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Gauge, Zap, Search, AlertCircle, CheckCircle2, History, Clock, Trash2 } from 'lucide-react';

export default function MobileSpeedLab() {
    const { selectedProject } = useProject();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (historyOpen && selectedProject?.id) loadHistory();
    }, [historyOpen, selectedProject?.id]);

    const loadHistory = async () => {
        try {
            if (!selectedProject?.id) return;
            const data = await api.get(`/api/performance/history/${selectedProject.id}`);
            setHistory(data);
        } catch { toast.error("Failed to load history"); }
    };

    const handleAnalyze = async () => {
        if (!url) return toast.error("Enter URL");
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

        setLoading(true);
        setResult(null);
        try {
            const data = await api.post('/api/performance/analyze', {
                url: targetUrl,
                device: 'mobile',
                projectId: selectedProject?.id
            });
            setResult(data);
            toast.success("Done");
        } catch (e: any) {
            toast.error(e.response?.data?.error || "Failed");
        } finally { setLoading(false); }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    const MobileGauge = ({ title, score, icon: Icon }: any) => (
        <Card className="flex flex-col items-center p-3 active:scale-95 transition-transform" onClick={() => setDetailsOpen(true)}>
            <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (175 * score) / 100}
                    className={`${getScoreColor(score)}`}
                />
            </svg>
            <span className={`absolute mt-4 text-xs font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-[10px] mt-1 text-muted-foreground whitespace-nowrap">{title}</span>
        </Card>
    );

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Delete?')) return;
        try {
            await api.delete(`/api/performance/history/${id}`);
            loadHistory();
            if (result?.id === id) setResult(null);
            toast.success("Deleted");
        } catch { toast.error("Failed"); }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <Zap className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Speed Lab</h1>
                            <p className="text-sm text-muted-foreground">Mobile Performance Audit</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}>
                        <History className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="example.com"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="h-12 text-lg"
                    />
                    <Button size="icon" className="h-12 w-12 shrink-0 bg-yellow-500 hover:bg-yellow-600" onClick={handleAnalyze} disabled={loading}>
                        {loading ? <Zap className="w-5 h-5 animate-pulse" /> : <Search className="w-5 h-5" />}
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <div className="text-sm text-muted-foreground">Auditing... this takes ~15s</div>
                    </div>
                ) : result ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <MobileGauge title="Performance" score={result.scores.performance} icon={Zap} />
                            <MobileGauge title="SEO" score={result.scores.seo} icon={Search} />
                            <MobileGauge title="accessibility" score={result.scores.accessibility} icon={CheckCircle2} />
                            <MobileGauge title="Best Practices" score={result.scores.bestPractices} icon={AlertCircle} />
                        </div>

                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-semibold text-sm">Core Web Vitals</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                        <div className="text-xs text-muted-foreground">LCP</div>
                                        <div className="font-mono font-bold text-lg">{result.metrics.lcp}</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                        <div className="text-xs text-muted-foreground">CLS</div>
                                        <div className="font-mono font-bold text-lg">{result.metrics.cls}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button variant="outline" className="w-full" onClick={() => setDetailsOpen(true)}>View Opportunities</Button>
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground opacity-50">
                        <Zap className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Enter URL to start</p>
                    </div>
                )}
            </div>

            <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DrawerContent className="h-[80vh]">
                    <DrawerHeader>
                        <DrawerTitle>Optimization Opportunities</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        {result?.audits.map((a: any) => (
                            <div key={a.id} className="mb-4 pb-4 border-b last:border-0">
                                <div className="font-semibold text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    {a.title}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-6">{a.description}</p>
                            </div>
                        ))}
                    </div>
                </DrawerContent>
            </Drawer>

            <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
                <DrawerContent className="h-[80vh]">
                    <DrawerHeader>
                        <DrawerTitle>Audit History</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto space-y-3">
                        {history.map(run => (
                            <Card key={run.id} className="active:scale-95 transition-transform" onClick={() => {
                                setResult(run);
                                setHistoryOpen(false);
                            }}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{run.url}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> {new Date(run.timestamp).toLocaleDateString()} • {run.device}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className={`text-xl font-bold ${getScoreColor(run.scores.performance)}`}>
                                                {run.scores.performance}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-500 bg-red-100/50 dark:bg-red-900/20 hover:bg-red-100 hover:text-red-600 rounded-full"
                                                onClick={(e) => handleDelete(e, run.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
