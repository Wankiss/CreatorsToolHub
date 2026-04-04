import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Tv } from "lucide-react";

export function YouTubeChannelNameGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-channel-name-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Describe your channel niche or topic.", variant: "destructive" });
      return;
    }
    run({ niche });
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
          <Tv className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Channel Name Generator</h2>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Channel Niche / Topic *</label>
          <Input
            placeholder="e.g. personal finance, fitness for women, tech reviews..."
            value={niche}
            onChange={e => setNiche(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Channel Names</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Channel Name Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All names copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((name, i) => (
              <div key={i} className="flex items-center gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="flex-1 font-medium text-sm">{name}</span>
                <button onClick={() => copyItem(name, i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
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
