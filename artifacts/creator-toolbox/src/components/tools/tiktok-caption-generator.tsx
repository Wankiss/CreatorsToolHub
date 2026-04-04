import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, MessageSquare } from "lucide-react";

export function TikTokCaptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("grow-followers");
  const [tone, setTone] = useState("bold");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-caption-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, goal, tone, audience });
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
          <MessageSquare className="text-pink-500" size={22} />
          <h2 className="font-semibold text-lg">TikTok Caption Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. morning routine, 3 cooking hacks, my fitness journey..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, food, beauty..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners, moms, entrepreneurs..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="grow-followers">Grow Followers</option>
                <option value="increase-engagement">Increase Engagement</option>
                <option value="drive-traffic">Drive Traffic</option>
                <option value="build-community">Build Community</option>
                <option value="go-viral">Go Viral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="bold">Bold</option>
                <option value="relatable">Relatable</option>
                <option value="funny">Funny</option>
                <option value="educational">Educational</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
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
