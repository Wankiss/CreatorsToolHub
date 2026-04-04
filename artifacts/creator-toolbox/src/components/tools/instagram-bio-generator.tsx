import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, User } from "lucide-react";

export function InstagramBioGeneratorTool() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-bio-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your niche to generate bios.", variant: "destructive" });
      return;
    }
    run({ name, niche });
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
          <User className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Bio Generator</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Your Name</label>
            <Input placeholder="e.g. Emma, StyleByLara..." value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche *</label>
            <Input placeholder="e.g. fashion, food, travel, fitness..." value={niche} onChange={e => setNiche(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGenerate()} />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Bios</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Bio Options</h3>
          <div className="space-y-3">
            {outputs.map((bio, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>
                  <button onClick={() => copyItem(bio, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
                    {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{bio.length} / 150 chars</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
