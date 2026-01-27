import React, { useEffect, useRef } from 'react';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { MousePointerClick, Globe, Type, Clock, Camera, CheckCircle, Trash, Copy } from 'lucide-react';

interface FlowContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAddNode: (type: string, position: { x: number, y: number }) => void;
}

export const FlowContextMenu = ({ x, y, onClose, onAddNode }: FlowContextMenuProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSelect = (action: string) => {
        onAddNode(action, { x, y });
        onClose();
    };

    return (
        <div
            ref={ref}
            className="fixed z-50 w-64 rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
            style={{ top: y, left: x }}
        >
            <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search actions..." autoFocus />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Browser Actions">
                        <CommandItem onSelect={() => handleSelect('navigate')}>
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Navigate</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('click')}>
                            <MousePointerClick className="mr-2 h-4 w-4" />
                            <span>Click Element</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('type')}>
                            <Type className="mr-2 h-4 w-4" />
                            <span>Type Text</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('screenshot')}>
                            <Camera className="mr-2 h-4 w-4" />
                            <span>Screenshot</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Logic & Wait">
                        <CommandItem onSelect={() => handleSelect('wait')}>
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Wait / Sleep</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
};
