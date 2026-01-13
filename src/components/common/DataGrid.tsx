import 'react-data-grid/lib/styles.css';
import DataGrid, { Column, RenderEditCellProps } from 'react-data-grid';
import { useCallback, useState } from 'react';
import React from 'react';
import { cn } from '@/lib/utils';
// ... (skip types) 

// ... (skip SpreadsheetGrid component)

// Helper to create textarea editor with Local State (Buffered)
export function textEditor<TRow, TSummaryRow>({
    row,
    column,
    onRowChange,
    onClose
}: RenderEditCellProps<TRow, TSummaryRow>) {
    const [value, setValue] = useState((row as any)[column.key] as string || '');

    return (
        <textarea
            className="w-full h-full px-2 py-1 border-none outline-none bg-background text-foreground resize-none"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onRowChange({ ...row, [column.key]: value }, true)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onRowChange({ ...row, [column.key]: value }, true); // Commit and close
                }
                // Shift+Enter will insert newline locally in value
            }}
        />
    );
}

interface DataGridProps<R> {
    columns: Column<R>[];
    rows: R[];
    onRowsChange: (rows: R[]) => void;
    className?: string;
}

export function SpreadsheetGrid<R extends { id: string | number }>({ columns, rows, onRowsChange, className }: DataGridProps<R>) {

    // Custom styling to match app theme
    const gridClassName = cn(
        "rdg-light dark:rdg-dark text-sm border rounded-md h-full w-full",
        className
    );

    const handleCopy = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        // Basic copy implementation handled by browser default for now
        // react-data-grid specific copy logic can be added here if needed
    }, []);

    // Auto-size columns logic
    const sizingColumns = React.useMemo(() => {
        return columns.map(col => {
            if (col.width) return col; // Respect manual width if set

            // Calculate max length in this column's data
            const maxCharLength = rows.reduce((max, row) => {
                const cellValue = (row as any)[col.key];
                const strLen = cellValue ? String(cellValue).length : 0;
                return Math.max(max, strLen);
            }, typeof col.name === 'string' ? col.name.length : 10); // Start with header length

            // Estimate width: 8px per char aprox + 24px padding
            const estimatedWidth = Math.min(Math.max(maxCharLength * 8 + 24, 80), 500);

            return { ...col, width: estimatedWidth };
        });
    }, [columns, rows]);

    // Dynamic Row Height Calculation
    const getRowHeight = (row: R) => {
        let maxLines = 1;
        const CHARS_PER_LINE = 50; // Approx chars per line for typical column width
        const LINE_HEIGHT = 20;
        const PADDING = 24;

        columns.forEach(col => {
            const val = (row as any)[col.key];
            if (val) {
                const str = String(val);
                // Count newlines explicitly
                const newlineCount = (str.match(/\n/g) || []).length + 1;
                // Estimate wrapping lines
                const wrapLines = Math.ceil(str.length / CHARS_PER_LINE);

                maxLines = Math.max(maxLines, Math.max(newlineCount, wrapLines));
            }
        });

        // Min height 50, Max height 400 (to prevent insane rows)
        return Math.min(Math.max(maxLines * LINE_HEIGHT + PADDING, 50), 400);
    };

    return (
        <div className="h-full w-full bg-background" onCopy={handleCopy}>
            <DataGrid
                columns={sizingColumns}
                rows={rows}
                rowKeyGetter={(row) => row.id}
                onRowsChange={onRowsChange}
                className={gridClassName}
                rowHeight={getRowHeight} // Dynamic height
                headerRowHeight={40}
                style={{ height: '100%' }}
            />
            <style>{`
                .rdg-cell {
                    white-space: pre-wrap;
                    word-break: break-word;
                    line-height: 1.3;
                    display: block !important; 
                    overflow-y: hidden !important; /* expand instead of scroll */
                    text-overflow: unset !important;
                    padding: 8px;
                    align-items: flex-start !important;
                }
                .rdg-cell::-webkit-scrollbar-thumb {
                    background: #888; 
                    border-radius: 2px;
                }
                
                /* Dark Mode Overrides for React Data Grid */
                .dark .rdg {
                    --rdg-color: hsl(var(--foreground));
                    --rdg-background-color: hsl(var(--background));
                    --rdg-header-background-color: hsl(var(--secondary));
                    --rdg-row-hover-background-color: hsl(var(--muted) / 0.5);
                    --rdg-border-color: hsl(var(--border));
                    --rdg-selection-color: hsl(var(--primary));
                    --rdg-font-size: 14px;
                    
                    color-scheme: dark;
                }
                
                .rdg {
                    --rdg-header-background-color: hsl(var(--secondary) / 0.5);
                }
            `}</style>
        </div>
    );
}

// Helper to create textarea editor

