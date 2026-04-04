import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Calendar } from "lucide-react";

export function InstagramContentPlannerTool() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [freq, setFreq] = useState("5");
  const [goal, setGoal] = useState("growth");
  const [style, setStyle] = useState("mixed");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("instagram-content-planner");
  const { toast } = useToast();

  const plan = outputs.join("\n");

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your Instagram niche.", variant: "destructive" });
      return;
    }
    run({ niche, audience, freq: Number(freq), goal, style, pillars: "education,entertainment,personal,tips" });
  };

  const copyPlan = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    toast({ title: "Content plan copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Content Planner</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche *</label>
            <Input placeholder="e.g. fitness, travel, food, fashion, business..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Audience</label>
            <Input placeholder="e.g. women 25-40, entrepreneurs, fitness beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Posts per Week</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={freq} onChange={e => setFreq(e.target.value)}>
                <option value="3">3 posts/week</option>
                <option value="5">5 posts/week</option>
                <option value="7">7 posts/week (daily)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Main Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="growth">Grow Followers</option>
                <option value="engagement">Boost Engagement</option>
                <option value="sales">Drive Sales</option>
                <option value="brand">Build Brand</option>
                <option value="community">Build Community</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content Style</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="mixed">Mixed (Reels + Carousels + Stories)</option>
                <option value="reels">Mostly Reels</option>
                <option value="carousel">Mostly Carousels</option>
                <option value="static">Static Posts</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Creating your plan with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Content Plan</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {plan && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your 7-Day Content Plan</h3>
            <Button variant="outline" size="sm" onClick={copyPlan}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy Plan</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[600px] overflow-y-auto">
            {plan}
          </pre>
        </Card>
      )}
    </div>
  );
}
