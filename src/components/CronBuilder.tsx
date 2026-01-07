import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CronBuilderProps {
    value: string;
    onChange: (cron: string) => void;
}

export function CronBuilder({ value, onChange }: CronBuilderProps) {
    const [mode, setMode] = useState<"daily" | "weekly" | "monthly" | "advanced">("daily");

    // Internal state for builder parts
    const [hour, setHour] = useState("9");
    const [minute, setMinute] = useState("0");
    const [weekdays, setWeekdays] = useState<string[]>(["1"]); // Mon
    const [monthDay, setMonthDay] = useState("1");

    // Hydrate state from incoming value (simple parsing)
    useEffect(() => {
        // Very basic detection to switch tabs if possible. 
        // Real parsing is complex, so we stick to generating standard patterns.
    }, [value]);

    const updateCron = (newMode: string, h: string, m: string, wd: string[], md: string) => {
        let cron = "";
        if (newMode === "daily") {
            cron = `${m} ${h} * * *`;
        } else if (newMode === "weekly") {
            cron = `${m} ${h} * * ${wd.join(",")}`;
        } else if (newMode === "monthly") {
            cron = `${m} ${h} ${md} * *`;
        }
        if (cron) onChange(cron);
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode as any);
        updateCron(newMode, hour, minute, weekdays, monthDay);
    };

    const toggleWeekday = (day: string) => {
        const newDays = weekdays.includes(day)
            ? weekdays.filter(d => d !== day)
            : [...weekdays, day];
        setWeekdays(newDays.sort());
        updateCron("weekly", hour, minute, newDays, monthDay);
    };

    const HOURS = Array.from({ length: 24 }, (_, i) => i.toString());
    const MINUTES = ["0", "15", "30", "45"];
    const DAYS = [
        { id: "1", label: "Mon" }, { id: "2", label: "Tue" }, { id: "3", label: "Wed" },
        { id: "4", label: "Thu" }, { id: "5", label: "Fri" }, { id: "6", label: "Sat" }, { id: "0", label: "Sun" }
    ];

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <div className="pt-4 space-y-4">
                    {mode !== 'advanced' && (
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Time (Hour)</Label>
                                <Select value={hour} onValueChange={(v) => { setHour(v); updateCron(mode, v, minute, weekdays, monthDay); }}>
                                    <SelectTrigger> <SelectValue /> </SelectTrigger>
                                    <SelectContent>
                                        {HOURS.map(h => <SelectItem key={h} value={h}>{h.padStart(2, '0')}:00</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label>Minute</Label>
                                <Select value={minute} onValueChange={(v) => { setMinute(v); updateCron(mode, hour, v, weekdays, monthDay); }}>
                                    <SelectTrigger> <SelectValue /> </SelectTrigger>
                                    <SelectContent>
                                        {MINUTES.map(m => <SelectItem key={m} value={m}>{m.padStart(2, '0')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <TabsContent value="daily">
                        <p className="text-sm text-muted-foreground">Runs every day at {hour}:{minute.padStart(2, '0')}.</p>
                    </TabsContent>

                    <TabsContent value="weekly">
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {DAYS.map(d => (
                                <div key={d.id} className="flex items-center space-x-2">
                                    <Checkbox id={`d-${d.id}`} checked={weekdays.includes(d.id)} onCheckedChange={() => toggleWeekday(d.id)} />
                                    <label htmlFor={`d-${d.id}`} className="text-sm cursor-pointer">{d.label}</label>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="monthly">
                        <div className="space-y-2">
                            <Label>Day of Month</Label>
                            <Select value={monthDay} onValueChange={(v) => { setMonthDay(v); updateCron(mode, hour, minute, weekdays, v); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">Runs on day {monthDay} of every month at {hour}:{minute.padStart(2, '0')}.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="advanced">
                        <div className="space-y-2">
                            <Label>Raw Cron Expression</Label>
                            <div className="flex gap-2">
                                <input
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Format: * * * * * (min hour day month weekday)</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
