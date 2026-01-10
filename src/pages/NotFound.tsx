import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative z-10 text-center space-y-6 max-w-md mx-auto">
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate({ to: '/' })}
          className="group shadow-lg hover:shadow-xl transition-all"
        >
          <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
