import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
    // DEBUG: Removed check to verify rendering
    // if (!window.electron) return null;
    console.log('TitleBar rendering check. window.electron:', !!window.electron);

    return (
        <div className="h-10 bg-background/95 backdrop-blur flex items-center justify-between border-b select-none z-50 w-full" style={{ WebkitAppRegion: 'drag' } as any}>
            <div className="flex items-center px-4 gap-2">
                {/* <span className="text-xs font-medium text-muted-foreground">Bug Binder Desktop</span> */}
                <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-primary"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
            </div>

            <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <button
                    onClick={() => {
                        console.log('Minimize clicked');
                        if (window.electron) window.electron.minimize();
                        else alert('Electron IPC not available!');
                    }}
                    className="h-full px-4 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center focus:outline-none"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        console.log('Maximize clicked');
                        if (window.electron) window.electron.maximize();
                        else alert('Electron IPC not available!');
                    }}
                    className="h-full px-4 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center focus:outline-none"
                >
                    <Square className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => {
                        console.log('Close clicked');
                        if (window.electron) window.electron.close();
                        else alert('Electron IPC not available!');
                    }}
                    className="h-full px-4 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center focus:outline-none"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
