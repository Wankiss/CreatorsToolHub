import { useState, useCallback } from "react";

export interface AiToolState {
  outputs: string[];
  loading: boolean;
  error: string | null;
}

export function useAiTool(slug: string) {
  const [outputs, setOutputs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (inputs: Record<string, string | number | boolean>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tools/${slug}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? `Server error ${res.status}`);
        }
        const data = await res.json();
        setOutputs(data.outputs ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { outputs, loading, error, run };
}
