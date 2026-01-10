import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const scrolledElementRef = useRef<HTMLElement | null>(null);
    const { pathname } = useLocation();

    // Reset when changing routes
    useEffect(() => {
        setIsVisible(false);
        scrolledElementRef.current = null;
    }, [pathname]);

    useEffect(() => {
        const handleScroll = (event: Event) => {
            const target = event.target as HTMLElement;

            // Simplified detection: if ANY element scrolls > 100px, show button
            // This covers tables, lists, main window, etc.

            scrolledElementRef.current = target;

            if (target.scrollTop > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Use capture: true to detect scroll events on children (scroll doesn't bubble)
        window.addEventListener("scroll", handleScroll, { capture: true });

        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, []);

    const scrollToTop = () => {
        const element = scrolledElementRef.current;
        if (element) {
            element.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            // Fallback: try main window and known containers
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.getElementById("main-content-scroll")?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div
            className={cn(
                "fixed bottom-24 right-8 z-[9999] transition-all duration-300 transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
            )}
        >
            <Button
                onClick={scrollToTop}
                size="icon"
                className="h-16 w-16 rounded-full shadow-2xl bg-orange-600 text-white hover:bg-orange-700 hover:scale-110 transition-all border-4 border-white animate-in zoom-in duration-300"
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-8 w-8 animate-pulse" />
            </Button>
        </div>
    );
}
