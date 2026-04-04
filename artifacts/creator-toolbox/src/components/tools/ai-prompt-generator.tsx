import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Bot } from "lucide-react";

export function AiPromptGeneratorTool() {
  const [contentType, setContentType] = useState("youtube-script");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("engagement");
  const [tone, setTone] = useState("casual");
  const [platform, setPlatform] = useState("chatgpt");
  const [wordCount, setWordCount] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("ai-prompt-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your niche or topic.", variant: "destructive" });
      return;
    }
    run({ contentType, niche, audience, goal, tone, platform, wordCount });
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
          <Bot className="text-violet-500" size={22} />
          <h2 className="font-semibold text-lg">AI Prompt Generator</h2>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={contentType} onChange={e => setContentType(e.target.value)}>
                <option value="youtube-script">YouTube Script</option>
                <option value="tiktok-script">TikTok Script</option>
                <option value="blog-post">Blog Post</option>
                <option value="social-caption">Social Media Caption</option>
                <option value="email">Email Newsletter</option>
                <option value="product-description">Product Description</option>
                <option value="ad-copy">Ad Copy</option>
                <option value="hooks">Content Hooks</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">AI Platform</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="copilot">Copilot</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche / Topic *</label>
            <Input placeholder="e.g. personal finance, fitness, travel photography..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="engagement">Engagement</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="conversion">Conversion / Sales</option>
                <option value="viral">Go Viral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="educational">Educational</option>
                <option value="funny">Funny</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Word Count (optional)</label>
            <Input placeholder="e.g. 500, 1000..." value={wordCount} onChange={e => setWordCount(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Prompts</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Ready-to-Use AI Prompts</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n\n")); toast({ title: "All prompts copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-3">
            {outputs.map((prompt, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed">{prompt}</p>
                  <button onClick={() => copyItem(prompt, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
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
