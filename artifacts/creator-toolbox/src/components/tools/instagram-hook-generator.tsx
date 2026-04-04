import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Zap } from "lucide-react";

export function InstagramHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-hook-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your post or Reel topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience });
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
          <Zap className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Hook Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Post / Reel Topic *</label>
            <Input placeholder="e.g. morning skincare routine, 5 money mistakes, travel hacks..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. beauty, finance, food..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. women 25-35, beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Hooks</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Scroll-Stopping Hooks</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All hooks copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((hook, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <Zap size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span className="flex-1 text-sm font-medium leading-relaxed">{hook}</span>
                <button onClick={() => copyItem(hook, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
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
