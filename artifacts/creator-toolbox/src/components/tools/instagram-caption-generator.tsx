import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, MessageSquare } from "lucide-react";

export function InstagramCaptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState("positive");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-caption-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your post topic.", variant: "destructive" });
      return;
    }
    run({ topic, mood });
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
          <MessageSquare className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Caption Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Post Topic *</label>
            <Input placeholder="e.g. sunset at the beach, new workout routine, coffee morning..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mood / Tone</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={mood} onChange={e => setMood(e.target.value)}>
              <option value="positive">Positive & Uplifting</option>
              <option value="inspirational">Inspirational</option>
              <option value="funny">Funny & Witty</option>
              <option value="educational">Educational</option>
              <option value="relatable">Relatable</option>
              <option value="professional">Professional</option>
              <option value="aesthetic">Aesthetic / Minimal</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Captions</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Caption Options</h3>
          <div className="space-y-3">
            {outputs.map((caption, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{caption}</p>
                  <button onClick={() => copyItem(caption, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
                    {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
