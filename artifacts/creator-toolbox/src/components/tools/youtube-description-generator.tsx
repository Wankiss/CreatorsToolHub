import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, FileText } from "lucide-react";

export function YouTubeDescriptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [channelName, setChannelName] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-description-generator");
  const { toast } = useToast();

  const description = outputs.join("\n");

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, channelName });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    toast({ title: "Description copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Description Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input
              placeholder="e.g. 10 productivity tips for remote workers..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Channel Name</label>
            <Input
              placeholder="e.g. TechWithMike"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Description</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {description && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Description</h3>
            <Button variant="outline" size="sm" onClick={copyAll}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[500px] overflow-y-auto">
            {description}
          </pre>
        </Card>
      )}
    </div>
  );
}
