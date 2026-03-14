import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Activity } from "lucide-react";
import type { Tool } from "@workspace/api-client-react";

export function ToolCard({ tool }: { tool: Tool }) {
  // Map standard emojis/icons if possible, or just render the string
  const isEmoji = tool.icon && tool.icon.length <= 2;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="group relative overflow-hidden bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col border-border/50 rounded-2xl cursor-pointer">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
              {isEmoji ? tool.icon : "✨"}
            </div>
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium rounded-full px-3">
              {tool.categoryName}
            </Badge>
          </div>
          
          <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
            {tool.shortDescription || tool.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center text-xs text-muted-foreground font-medium gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>{tool.usageCount.toLocaleString()} uses</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
              Try it <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
        
        {/* Decorative corner gradient */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
      </Card>
    </Link>
  );
}
