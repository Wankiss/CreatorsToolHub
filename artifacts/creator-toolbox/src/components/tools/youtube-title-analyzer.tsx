import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, TrendingUp } from "lucide-react";

export function YouTubeTitleAnalyzerTool() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-title-analyzer");
  const { toast } = useToast();

  const report = outputs.join("\n");

  const handleAnalyze = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter a YouTube title to analyse.", variant: "destructive" });
      return;
    }
    run({ title, keyword, niche, audience });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Title Analyzer</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">YouTube Title *</label>
            <Input
              placeholder="Enter the title you want to analyse..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length} / 70 chars recommended</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Keyword</label>
              <Input placeholder="e.g. make money online..." value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. finance, fitness..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Analysing with AI...</> : <><Sparkles size={16} className="mr-2" />Analyse Title</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {report && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Title Analysis</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(report); setCopied(true); toast({ title: "Report copied!" }); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border">
            {report}
          </pre>
        </Card>
      )}
    </div>
  );
}
