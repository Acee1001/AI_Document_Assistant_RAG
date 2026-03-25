"use client";

import { useEffect, useState } from "react";

const lines = [
  "Uploading research.pdf...",
  "Extracting 2,847 characters...",
  "Creating 34 chunks...",
  "Generating embeddings...",
  "✅ Ready! Ask your questions."
];

export default function TerminalDemo() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [progressed, setProgressed] = useState("");

  useEffect(() => {
    const currentLine = lines[visibleIndex];
    let idx = 0;
    const interval = window.setInterval(() => {
      idx += 1;
      setProgressed(currentLine.slice(0, idx));
      if (idx >= currentLine.length) {
        window.clearInterval(interval);
        const timeout = window.setTimeout(() => {
          setVisibleIndex((prev) => (prev + 1) % lines.length);
        }, 1000);
        return () => window.clearTimeout(timeout);
      }
    }, 36);

    return () => window.clearInterval(interval);
  }, [visibleIndex]);

  return (
    <div className="glass-card relative max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#0f1222]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      <div className="mb-3 flex items-center gap-2 text-xs text-text-secondary">
        <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
        <span className="ml-auto animate-pulse-glow">fake-term.sh</span>
      </div>
      <pre className="min-h-[150px] text-sm leading-6 text-white">
        {lines.slice(0, visibleIndex).map((line, idx) => (
          <div key={`${line}-${idx}`} className="text-cyan-200">&gt; {line}</div>
        ))}
        <div className="text-green-300">&gt; {progressed}
          <span className="inline-block h-4 w-1 animate-blink bg-green-200 align-text-bottom" />
        </div>
      </pre>
    </div>
  );
}
