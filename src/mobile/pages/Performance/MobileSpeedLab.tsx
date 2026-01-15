import React, { useState } from 'react';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Gauge, Zap, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MobileSpeedLab() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleAnalyze = async () => {
        if (!url) return toast.error("Enter URL");
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

        setLoading(true);
        setResult(null);
        try {
            const data = await api.post('/api/performance/analyze', { url: targetUrl, device: 'mobile' });
            setResult(data);
            toast.success("Done");
        } catch { toast.error("Failed"); }
        finally { setLoading(false); }
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

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-xl">
                        <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Speed Lab</h1>
                        <p className="text-sm text-muted-foreground">Mobile Performance Audit</p>
                    </div>
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
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
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
        </div>
    );
}
