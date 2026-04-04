import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, ScrollText } from "lucide-react";

export function YouTubeScriptGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState("7");
  const [tone, setTone] = useState("educational");
  const [goal, setGoal] = useState("educate");
  const [style, setStyle] = useState("tutorial");
  const [keywords, setKeywords] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-script-generator");
  const { toast } = useToast();

  const script = outputs.join("\n");

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, audience, length, tone, goal, style, keywords });
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
          <ScrollText className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Script Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input
              placeholder="e.g. how to save money on groceries, Python for beginners..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners, busy parents..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Keywords to Include</label>
              <Input placeholder="e.g. budget, savings, tips..." value={keywords} onChange={e => setKeywords(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Length (mins)</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={length} onChange={e => setLength(e.target.value)}>
                <option value="3">~3 min</option>
                <option value="5">~5 min</option>
                <option value="7">~7 min</option>
                <option value="10">~10 min</option>
                <option value="15">~15 min</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="motivational">Motivational</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="educate">Educate</option>
                <option value="entertain">Entertain</option>
                <option value="inspire">Inspire</option>
                <option value="sell">Convert / Sell</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Style</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="tutorial">Tutorial</option>
                <option value="story">Storytelling</option>
                <option value="list">List / Tips</option>
                <option value="interview">Interview</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Writing script with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Script</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {script && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Video Script</h3>
            <Button variant="outline" size="sm" onClick={copyScript}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy Script</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[600px] overflow-y-auto">
            {script}
          </pre>
        </Card>
      )}
    </div>
  );
}
