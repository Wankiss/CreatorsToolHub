import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Search } from "lucide-react";

export function YouTubeKeywordGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [contentType, setContentType] = useState("tutorial");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-keyword-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your seed topic or keyword.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience, contentType });
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
          <Search className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Keyword Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Seed Topic / Keyword *</label>
            <Input
              placeholder="e.g. how to invest, beginner workout, vegan meal prep..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. finance, fitness..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Audience</label>
              <Input placeholder="e.g. beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={contentType} onChange={e => setContentType(e.target.value)}>
                <option value="tutorial">Tutorial</option>
                <option value="review">Review</option>
                <option value="list">List / Tips</option>
                <option value="vlog">Vlog</option>
                <option value="shorts">Shorts</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Researching with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Keywords</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Keyword Suggestions</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All keywords copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((kw, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="flex-1 text-sm leading-relaxed font-mono">{kw}</span>
                <button onClick={() => copyItem(kw, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
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
