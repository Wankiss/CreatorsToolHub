import { useEffect, useRef } from "react";

/** Adsterra Native Banner: the script must be injected after mount in React. */
export function NativeBannerAd() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src =
      "https://pl31560956.profitableratecpmnetwork.com/33fcc110e28e99c37ec8fc6022814e9e/invoke.js";
    el.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return (
    <div ref={ref} className="my-6 flex justify-center">
      <div id="container-33fcc110e28e99c37ec8fc6022814e9e" />
    </div>
  );
}

/** Adsterra 300x250 banner: runs inside an iframe so its script works in React. */
export function Banner300x250Ad() {
  const html = `<!DOCTYPE html><html><body style="margin:0"><script>atOptions={'key':'f5c54a8f9144e7dc0612ecb45c87ccba','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/f5c54a8f9144e7dc0612ecb45c87ccba/invoke.js"></script></body></html>`;

  return (
    <div className="my-6 flex justify-center">
      <iframe
        title="Advertisement"
        srcDoc={html}
        width={300}
        height={250}
        scrolling="no"
        style={{ border: 0 }}
      />
    </div>
  );
}
