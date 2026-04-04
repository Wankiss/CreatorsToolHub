import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, ScrollText } from "lucide-react";

export function TikTokScriptGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("60");
  const [tone, setTone] = useState("engaging");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("tiktok-script-generator");
  const { toast } = useToast();

  const script = outputs.join("\n");

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience, duration, tone });
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast({ title: "Script copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="text-pink-500" size={22} />
          <h2 className="font-semibold text-lg">TikTok Script Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. 3 signs you're bad with money, how I lost 10kg..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, finance, lifestyle..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. young adults, beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
                <option value="90">90 seconds</option>
                <option value="180">3 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="engaging">Engaging</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="motivational">Motivational</option>
                <option value="funny">Funny</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Writing script with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Script</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {script && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your TikTok Script</h3>
            <Button variant="outline" size="sm" onClick={copyScript}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy Script</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[500px] overflow-y-auto">
            {script}
          </pre>
        </Card>
      )}
    </div>
  );
}
