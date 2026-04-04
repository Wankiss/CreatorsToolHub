import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Zap } from "lucide-react";

export function TikTokHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("bold");
  const [count, setCount] = useState("10");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-hook-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience, tone, count: Number(count) });
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
          <Zap className="text-pink-500" size={22} />
          <h2 className="font-semibold text-lg">TikTok Hook Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. how to lose weight fast, 5 money habits..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, finance, beauty..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. women 25-35, college students..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="bold">Bold</option>
                <option value="shocking">Shocking</option>
                <option value="relatable">Relatable</option>
                <option value="curious">Curious</option>
                <option value="funny">Funny</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Number of Hooks</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={count} onChange={e => setCount(e.target.value)}>
                <option value="5">5 hooks</option>
                <option value="10">10 hooks</option>
                <option value="15">15 hooks</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Hooks</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Viral Hooks</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All hooks copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((hook, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <Zap size={14} className="text-pink-500 mt-0.5 shrink-0" />
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
