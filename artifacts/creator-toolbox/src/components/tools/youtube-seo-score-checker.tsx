import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, BarChart2 } from "lucide-react";

export function YouTubeSeoScoreCheckerTool() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-seo-score-checker");
  const { toast } = useToast();

  const report = outputs.join("\n");

  const handleCheck = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter your video title to analyse.", variant: "destructive" });
      return;
    }
    run({ title, description, tags, targetKeyword, secondaryKeywords });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube SEO Score Checker</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Title *</label>
            <Input placeholder="Your YouTube video title..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Keyword</label>
            <Input placeholder="Main keyword you're targeting..." value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Video Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px] resize-y"
              placeholder="Paste your video description here..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
              <Input placeholder="tag1, tag2, tag3..." value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Secondary Keywords</label>
              <Input placeholder="related keyword 1, keyword 2..." value={secondaryKeywords} onChange={e => setSecondaryKeywords(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleCheck} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Analysing with AI...</> : <><Sparkles size={16} className="mr-2" />Check SEO Score</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {report && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">SEO Analysis Report</h3>
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
