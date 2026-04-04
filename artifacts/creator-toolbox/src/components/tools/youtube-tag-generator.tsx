import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Tag } from "lucide-react";

export function YouTubeTagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-tag-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic });
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
          <Tag className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Tag Generator</h2>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Video Topic / Keyword *</label>
          <Input
            placeholder="e.g. photography tips for beginners, vegan recipes..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Tags</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Tags</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join(", ")); toast({ title: "All tags copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputs.map((tag, i) => (
              <button
                key={i}
                onClick={() => copyItem(tag, i)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm bg-muted/30 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
              >
                {tag}
                {copied === i ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
