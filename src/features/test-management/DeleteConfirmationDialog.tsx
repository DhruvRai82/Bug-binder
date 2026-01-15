import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    verificationText?: string;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    verificationText
}: DeleteConfirmationDialogProps) {
    const [inputValue, setInputValue] = useState("");

    const isConfirmed = !verificationText || inputValue === verificationText;

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setInputValue("");
        }
        onOpenChange(newOpen);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {verificationText && (
                    <div className="py-4 space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">
                            Type <span className="text-foreground font-bold select-all">"{verificationText}"</span> to confirm:
                        </Label>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Type "${verificationText}"`}
                            className="bg-muted/50"
                            autoComplete="off"
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            if (isConfirmed) {
                                onConfirm();
                                onOpenChange(false);
                            }
                        }}
                        disabled={!isConfirmed}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
