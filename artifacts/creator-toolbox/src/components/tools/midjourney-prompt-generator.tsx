import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import { Sparkles, Copy, Check, Loader2, Image } from "lucide-react";

export function MidjourneyPromptGeneratorTool() {
  const [visualType, setVisualType] = useState("youtube-thumbnail");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [mood, setMood] = useState("dramatic");
  const [lighting, setLighting] = useState("cinematic");
  const [perspective, setPerspective] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("midjourney-prompt-generator");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!subject.trim()) {
      toast({ title: "Subject required", description: "Describe what you want to generate.", variant: "destructive" });
      return;
    }
    run({ visualType, subject, style, mood, lighting, perspective, colorPalette });
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
          <Image className="text-violet-500" size={22} />
          <h2 className="font-semibold text-lg">Midjourney Prompt Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Visual Type</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={visualType} onChange={e => setVisualType(e.target.value)}>
              <option value="youtube-thumbnail">YouTube Thumbnail</option>
              <option value="instagram-post">Instagram Post</option>
              <option value="tiktok-cover">TikTok Cover</option>
              <option value="logo">Logo / Brand Asset</option>
              <option value="product-photo">Product Photo</option>
              <option value="portrait">Portrait / Headshot</option>
              <option value="background">Background / Scene</option>
              <option value="illustration">Illustration</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subject / Description *</label>
            <Input placeholder="e.g. person holding money with shocked expression, futuristic city at night..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Art Style</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="photorealistic">Photorealistic</option>
                <option value="digital-art">Digital Art</option>
                <option value="illustration">Illustration</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="oil-painting">Oil Painting</option>
                <option value="3d-render">3D Render</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mood</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={mood} onChange={e => setMood(e.target.value)}>
                <option value="dramatic">Dramatic</option>
                <option value="vibrant">Vibrant</option>
                <option value="calm">Calm</option>
                <option value="dark">Dark / Moody</option>
                <option value="bright">Bright / Cheerful</option>
                <option value="mysterious">Mysterious</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Lighting</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={lighting} onChange={e => setLighting(e.target.value)}>
                <option value="cinematic">Cinematic</option>
                <option value="golden-hour">Golden Hour</option>
                <option value="studio">Studio</option>
                <option value="neon">Neon</option>
                <option value="natural">Natural</option>
                <option value="backlit">Backlit</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Perspective</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={perspective} onChange={e => setPerspective(e.target.value)}>
                <option value="">Any</option>
                <option value="close-up">Close-up</option>
                <option value="wide-angle">Wide Angle</option>
                <option value="bird-eye">Bird's Eye</option>
                <option value="low-angle">Low Angle</option>
                <option value="portrait">Portrait / Front</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Color Palette (optional)</label>
            <Input placeholder="e.g. deep blue and gold, neon pink and black, earth tones..." value={colorPalette} onChange={e => setColorPalette(e.target.value)} />
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
            <h3 className="font-semibold">Midjourney Prompts</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n\n")); toast({ title: "All prompts copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-3">
            {outputs.map((prompt, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed font-mono">{prompt}</p>
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
