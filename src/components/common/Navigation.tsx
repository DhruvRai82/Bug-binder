import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TestTube2,
  Bug,
  Code2,
  BarChart3,
  Settings,
  User,
  Bell,
  Search
} from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="bg-gradient-card border-b border-border/50 shadow-soft">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary rounded-lg p-2">
                <TestTube2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">TestFlow</h1>
                <p className="text-xs text-muted-foreground">Test Management Platform</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                <TestTube2 className="mr-2 h-4 w-4" />
                Test Cases
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary relative">
                <Bug className="mr-2 h-4 w-4" />
                Bugs
                {/* <Badge 
                  variant="destructive" 
                  className="ml-2 text-xs px-1.5 py-0.5"
                >
                  18
                </Badge> */}
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                <Code2 className="mr-2 h-4 w-4" />
                Scripts
              </Button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tests, bugs..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Profile */}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <User className="mr-2 h-4 w-4" />
              John Doe
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};