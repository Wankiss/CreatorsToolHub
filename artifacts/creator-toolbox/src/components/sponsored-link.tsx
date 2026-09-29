const SMARTLINK =
  "https://www.profitableratecpmnetwork.com/ckxkaw2itz?key=27e5b6df1044391ea755601560ec77c9";

/** Clearly labeled sponsored link (Adsterra Smartlink). */
export function SponsoredLink() {
  return (
    <p className="text-sm text-slate-400 flex items-center gap-2">
      <span className="rounded border border-slate-500 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
        Sponsored
      </span>
      
      <a
        href={SMARTLINK}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="text-slate-300 underline underline-offset-4 hover:text-white transition-colors"
      >
        Discover more offers we recommend
      </a>
    </p>
  );
}
