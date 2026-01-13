
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveRecordingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, module: string) => void;
}

export function SaveRecordingDialog({ open, onOpenChange, onSave }: SaveRecordingDialogProps) {
    const [name, setName] = useState("");
    const [module, setModule] = useState("");

    const handleSave = () => {
        if (!name) return;
        onSave(name, module || "General");
        setName("");
        setModule("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Recording</DialogTitle>
                    <DialogDescription>
                        Give your recording a name and group it by module.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Recording Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Login Flow"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="module">Module (Optional)</Label>
                        <Input
                            id="module"
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            placeholder="e.g., Auth"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name}>
                        <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
