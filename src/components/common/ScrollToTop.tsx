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
                className="h-14 w-14 rounded-full shadow-xl bg-primary/20 text-primary-foreground hover:bg-primary/30 hover:scale-105 transition-all backdrop-blur-md border border-primary/30"
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-6 w-6" />
            </Button>
        </div>
    );
}
