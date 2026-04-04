import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, TrendingUp } from "lucide-react";

export function TikTokViralIdeaGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [trend, setTrend] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-viral-idea-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your content niche.", variant: "destructive" });
      return;
    }
    run({ niche, audience, trend });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-pink-500" size={22} />
          <h2 className="font-semibold text-lg">TikTok Viral Idea Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche *</label>
            <Input placeholder="e.g. fitness, finance, cooking, fashion, gaming..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. Gen Z, working moms, gym beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Trend / Format to Leverage</label>
              <Input placeholder="e.g. POV, Storytime, Day in my life..." value={trend} onChange={e => setTrend(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Viral Ideas</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Viral Video Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All ideas copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((idea, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <TrendingUp size={14} className="text-pink-500 mt-0.5 shrink-0" />
                <span className="flex-1 text-sm leading-relaxed">{idea}</span>
                <button onClick={() => copyItem(idea, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                  {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
