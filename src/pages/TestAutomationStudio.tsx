import { useState, useEffect } from "react";
import { Play, Save, Sparkles, Trash2, Plus, AlertCircle, MessageSquare, Code, Terminal, FileText, Bot, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AIChatbot from "@/features/ai/AIChatbot";

interface Script {
  id: string;
  name: string;
  description?: string;
  script: any;
  lastRun?: {
    status: 'pass' | 'fail' | 'error';
    timestamp: string;
    logs: string;
  };
}

interface TestAutomationStudioProps {
  selectedProject: { id: string; name: string };
}

const API_BASE = "http://localhost:8081/api/projects";

export default function TestAutomationStudio({ selectedProject }: TestAutomationStudioProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [scriptCode, setScriptCode] = useState("");
  const [consoleLogs, setConsoleLogs] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [newScriptDesc, setNewScriptDesc] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const { toast } = useToast();

  // Load scripts for the selected project
  useEffect(() => {
    if (selectedProject?.id) {
      loadScripts();
    }
  }, [selectedProject?.id]);

  const loadScripts = async () => {
    try {
      const response = await fetch(`${API_BASE}/${selectedProject.id}/scripts`);
      const data = await response.json();
      setScripts(data);
    } catch (error) {
      console.error("Error loading scripts:", error);
      toast({
        title: "Error",
        description: "Failed to load scripts",
        variant: "destructive",
      });
    }
  };

  const handleScriptSelect = (script: Script) => {
    setSelectedScript(script);
    // Display the actual code if it exists, otherwise show the script JSON
    const displayCode = (script as any).code || JSON.stringify(script.script, null, 2);
    setScriptCode(displayCode);
    if (script.lastRun) {
      setConsoleLogs(script.lastRun.logs);
    } else {
      setConsoleLogs("");
    }
  };

  const handleSaveScript = async () => {
    if (!selectedScript) return;

    try {
      const parsedScript = JSON.parse(scriptCode);

      const response = await fetch(
        `${API_BASE}/${selectedProject.id}/scripts/${selectedScript.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedScript,
            script: parsedScript,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Success",
        description: "Script saved successfully",
      });
      loadScripts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON or save failed",
        variant: "destructive",
      });
    }
  };

  const handleRunTest = async () => {
    if (!selectedScript) return;

    setIsRunning(true);
    setConsoleLogs("Starting test execution...\n");

    try {
      const response = await fetch(
        `${API_BASE}/${selectedProject.id}/scripts/${selectedScript.id}/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      setConsoleLogs(result.logs || result.error || "Test completed");

      if (result.status === "pass") {
        toast({
          title: "Test Passed",
          description: "All test steps executed successfully",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Check console logs for details",
          variant: "destructive",
        });
      }

      loadScripts();
    } catch (error) {
      setConsoleLogs(`Error: ${error}`);
      toast({
        title: "Error",
        description: "Failed to execute test",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `${API_BASE}/${selectedProject.id}/scripts/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: aiPrompt }),
        }
      );

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      setScriptCode(JSON.stringify(result.script, null, 2));
      setAiPrompt("");

      toast({
        title: "Success",
        description: "AI generated test script successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate script",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeFailure = async () => {
    if (!selectedScript?.lastRun || selectedScript.lastRun.status !== 'fail') {
      toast({
        title: "Info",
        description: "No failure logs to analyze",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/${selectedProject.id}/scripts/analyze-failure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: selectedScript.script,
            logs: selectedScript.lastRun.logs,
          }),
        }
      );

      const result = await response.json();

      setConsoleLogs(`\n\n=== AI ANALYSIS ===\n${result.analysis}\n\n${consoleLogs}`);

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed the failure",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze failure",
        variant: "destructive",
      });
    }
  };

  const handleCreateScript = async () => {
    if (!newScriptName.trim()) {
      toast({
        title: "Error",
        description: "Script name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${selectedProject.id}/scripts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newScriptName,
          description: newScriptDesc,
          script: {
            steps: [],
            baseUrl: "",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      const newScript = await response.json();

      toast({
        title: "Success",
        description: "Script created successfully",
      });

      setShowNewDialog(false);
      setNewScriptName("");
      setNewScriptDesc("");
      loadScripts();
      handleScriptSelect(newScript);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create script",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      await fetch(`${API_BASE}/${selectedProject.id}/scripts/${scriptId}`, {
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Script deleted successfully",
      });

      if (selectedScript?.id === scriptId) {
        setSelectedScript(null);
        setScriptCode("");
        setConsoleLogs("");
      }

      loadScripts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete script",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6 space-y-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Automation Studio
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            AI-powered test automation for {selectedProject?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowChatbot(!showChatbot)} className="shadow-sm">
            <Bot className="h-4 w-4 mr-2 text-blue-500" />
            AI Assistant
          </Button>
          <Button onClick={() => setShowNewDialog(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Scripts List */}
        <Card className="col-span-3 flex flex-col border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Test Scripts
            </CardTitle>
            <CardDescription>Select a script to edit</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              <div className="space-y-3">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer ${selectedScript?.id === script.id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "hover:bg-muted/50 hover:border-primary/50"
                      }`}
                    onClick={() => handleScriptSelect(script)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{script.name}</p>
                        {script.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {script.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScript(script.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        JSON
                      </Badge>
                      {script.lastRun && (
                        <Badge
                          variant={
                            script.lastRun.status === "pass"
                              ? "default"
                              : "destructive"
                          }
                          className="text-[10px] uppercase"
                        >
                          {script.lastRun.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor and Console */}
        <div className="col-span-9 flex flex-col space-y-6 overflow-hidden">
          {/* AI Generation */}
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 flex gap-3">
                  <Input
                    placeholder="Describe the test you want to create (e.g., 'Login test for user@example.com')"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateWithAI()}
                    className="bg-white/80 border-0 shadow-sm focus-visible:ring-purple-500"
                  />
                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Script Editor and Console */}
          <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-0 border-b bg-muted/30">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedScript ? selectedScript.name : "Select a script"}
                    </CardTitle>
                    <CardDescription>
                      {selectedScript ? "Edit and run your test script" : "Choose a script from the list to start"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {selectedScript?.lastRun?.status === 'fail' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeFailure}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Analyze Failure
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveScript}
                    disabled={!selectedScript}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRunTest}
                    disabled={!selectedScript || isRunning}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? "Running..." : "Run Test"}
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="editor"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Script Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="console"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Console Output
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 bg-background">
                  <TabsContent value="editor" className="m-0 h-[500px]">
                    <Textarea
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      placeholder="// Select a script or generate one with AI..."
                      className="h-full w-full resize-none border-0 p-6 font-mono text-sm focus-visible:ring-0 leading-relaxed"
                      disabled={!selectedScript}
                      spellCheck={false}
                    />
                  </TabsContent>

                  <TabsContent value="console" className="m-0 h-[500px]">
                    <ScrollArea className="h-full w-full bg-[#1e1e1e] text-white">
                      <pre className="p-6 font-mono text-sm whitespace-pre-wrap">
                        {consoleLogs || "// No logs yet. Run a test to see output here."}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* New Script Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl shadow-2xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              Create Automation Script
            </DialogTitle>
            <DialogDescription>
              Initialize a new test script. You can use AI to generate the steps later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Script Name</Label>
              <Input
                id="name"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                placeholder="e.g., User Login Flow"
                className="bg-background/50 border-input/50 focus:border-primary transition-all text-lg h-11"
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="description" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newScriptDesc}
                onChange={(e) => setNewScriptDesc(e.target.value)}
                placeholder="Briefly describe the test scenario..."
                rows={3}
                className="resize-none bg-background/50 border-input/50 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowNewDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateScript} className="flex-1 shadow-md" disabled={!newScriptName}>
                Create Script
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chatbot */}
      {showChatbot && <AIChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
