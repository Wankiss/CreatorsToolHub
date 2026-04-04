import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Hash } from "lucide-react";

export function YouTubeHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [quantity, setQuantity] = useState("20");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-hashtag-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, keywords, quantity: Number(quantity) });
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
          <Hash className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Hashtag Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input
              placeholder="e.g. home workout routine, digital marketing tips..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Extra Keywords</label>
              <Input
                placeholder="e.g. fitness, weight loss, gym..."
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">How Many Hashtags</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              >
                <option value="10">10 hashtags</option>
                <option value="15">15 hashtags</option>
                <option value="20">20 hashtags</option>
                <option value="30">30 hashtags</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Hashtags</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Hashtags</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join(" ")); toast({ title: "All hashtags copied!" }); }}>
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
