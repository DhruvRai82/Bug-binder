import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: Array<{
    label: string;
    value: string;
  }>;
  actions: Array<{
    label: string;
    variant: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  }>;
  className?: string;
  onClick?: () => void;
}

export const DashboardCard = ({
  title,
  description,
  icon,
  stats,
  actions,
  className,
  onClick
}: DashboardCardProps) => {
  return (
    <div 
      className={cn(
        "bg-gradient-card rounded-xl shadow-soft border border-border/50 overflow-hidden transition-smooth hover:shadow-medium",
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className={cn(
                "transition-smooth",
                index === 0 ? "flex-1" : "flex-1 sm:flex-initial"
              )}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Subtle bottom accent */}
      <div className="h-1 bg-gradient-primary opacity-60"></div>
    </div>
  );
};