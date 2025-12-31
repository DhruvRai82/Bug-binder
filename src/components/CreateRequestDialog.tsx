
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, method: string) => void;
}

export function CreateRequestDialog({ open, onOpenChange, onSave }: CreateRequestDialogProps) {
    const [name, setName] = useState("");
    const [method, setMethod] = useState("GET");

    const handleSave = () => {
        if (!name) return;
        onSave(name, method);
        setName("");
        setMethod("GET");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Request</DialogTitle>
                    <DialogDescription>
                        Add a new API request to this collection.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="req-name">Request Name</Label>
                        <Input
                            id="req-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Get All Users"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="req-method">Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger id="req-method">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
