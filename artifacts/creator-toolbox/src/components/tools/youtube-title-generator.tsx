import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Youtube } from "lucide-react";

export function YouTubeTitleGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("engaging");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-title-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic or keyword.", variant: "destructive" });
      return;
    }
    run({ topic, audience, tone });
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
          <Youtube className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Title Generator</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic / Keyword *</label>
            <Input
              placeholder="e.g. how to make money online, beginner guitar lessons..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input
                placeholder="e.g. beginners, entrepreneurs..."
                value={audience}
                onChange={e => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                <option value="engaging">Engaging</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="professional">Professional</option>
                <option value="shocking">Shocking / Clickbait</option>
              </select>
            </div>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Titles</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Titles</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All titles copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((title, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="flex-1 text-sm leading-relaxed">{title}</span>
                <button onClick={() => copyItem(title, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
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
