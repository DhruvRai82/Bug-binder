import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gauge, Smartphone, Monitor, Zap, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SpeedLab() {
    const { selectedProject } = useProject();
    const [url, setUrl] = useState('');
    const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!url) return toast.error("Enter a URL");

        // Normalize URL
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

        setLoading(true);
        setResult(null);

        try {
            const data = await api.post('/api/performance/analyze', {
                url: targetUrl,
                device
            });
            setResult(data);
            toast.success("Analysis Complete");
        } catch (err) {
            toast.error("Analysis Failed. Ensure URL is reachable.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    const ScoreGauge = ({ title, score, icon: Icon }: any) => (
        <Card className="flex flex-col items-center justify-center p-6 space-y-4 hover:bg-muted/50 transition-colors">
            <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={351}
                        strokeDashoffset={351 - (351 * score) / 100}
                        className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
                <Icon className="w-4 h-4" /> {title}
            </div>
        </Card>
    );

    return (
        <div className="h-full flex flex-col p-6 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Zap className="h-8 w-8 text-yellow-500 fill-current" /> Speed Lab
                </h1>
                <p className="text-muted-foreground text-lg">Measure and optimize your application's Core Web Vitals.</p>
            </div>

            {/* Analysis Bar */}
            <div className="flex gap-4 items-center bg-card p-2 rounded-xl shadow-lg border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Enter URL (e.g. https://google.com)"
                        className="pl-10 h-12 text-lg border-0 focus-visible:ring-0 bg-transparent"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                </div>

                <Tabs value={device} onValueChange={(v: any) => setDevice(v)} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="mobile"><Smartphone className="w-4 h-4 mr-2" /> Mobile</TabsTrigger>
                        <TabsTrigger value="desktop"><Monitor className="w-4 h-4 mr-2" /> Desktop</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button size="lg" onClick={handleAnalyze} disabled={loading} className="px-8 h-12 font-semibold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-xl transition-all hover:scale-105 active:scale-95">
                    {loading ? 'Analyzing...' : 'Analyze URL'}
                </Button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pulse">
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-semibold">Running Lighthouse Audit...</h3>
                        <p className="text-muted-foreground">Warming up Chrome, Measuring LCP, checking accessibility...</p>
                    </div>
                </div>
            )}

            {/* Results Dashboard */}
            {!loading && result && (
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                    {/* Key Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ScoreGauge title="Performance" score={result.scores.performance} icon={Zap} />
                        <ScoreGauge title="Accessibility" score={result.scores.accessibility} icon={CheckCircle2} />
                        <ScoreGauge title="Best Practices" score={result.scores.bestPractices} icon={AlertCircle} />
                        <ScoreGauge title="SEO" score={result.scores.seo} icon={Search} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Metrics */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Core Web Vitals</CardTitle>
                                <CardDescription>Key metrics that affect user experience.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                                    <span className="font-medium">Largest Contentful Paint</span>
                                    <Badge variant="outline" className="text-lg">{result.metrics.lcp}</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                                    <span className="font-medium">Cumulative Layout Shift</span>
                                    <Badge variant="outline" className="text-lg">{result.metrics.cls}</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                                    <span className="font-medium">Total Blocking Time</span>
                                    <Badge variant="outline" className="text-lg">{result.metrics.tbt}</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                                    <span className="font-medium">Speed Index</span>
                                    <Badge variant="outline" className="text-lg">{result.metrics.si}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Issues */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Top Opportunities</CardTitle>
                                <CardDescription>Fix these issues to improve your score.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.audits.map((audit: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                        <div className="mt-1">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="font-semibold">{audit.title}</div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{audit.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {result.audits.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                                        <p>No major issues found! Great job.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!loading && !result && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl ">
                    <Zap className="h-16 w-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-medium">Ready to Audit</h3>
                    <p>Enter a URL above to start the performance analysis.</p>
                </div>
            )}
        </div>
    );
}
