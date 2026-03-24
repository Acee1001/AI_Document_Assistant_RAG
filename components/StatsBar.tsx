"use client";

import { useEffect, useState } from "react";

interface StatsBarProps {
  totalFiles: number;
  totalChunks: number;
  totalQueries: number;
}

const Counter = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const end = value;
    const delta = end - start;
    if (delta === 0) return;

    const steps = 24;
    const stepMs = 16;
    let currentStep = 0;
    const timer = window.setInterval(() => {
      currentStep += 1;
      const next = Math.round(start + (delta * currentStep) / steps);
      setDisplay(next);
      if (currentStep >= steps) {
        window.clearInterval(timer);
        setDisplay(end);
      }
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
};

export default function StatsBar({ totalFiles, totalChunks, totalQueries }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="glass-card p-3">
        <p className="text-xs text-text-secondary">📄 Total files uploaded</p>
        <p className="mt-1 text-lg font-semibold text-text-primary">
          <Counter value={totalFiles} />
        </p>
      </div>
      <div className="glass-card p-3">
        <p className="text-xs text-text-secondary">🧩 Total chunks in index</p>
        <p className="mt-1 text-lg font-semibold text-text-primary">
          <Counter value={totalChunks} />
        </p>
      </div>
      <div className="glass-card p-3">
        <p className="text-xs text-text-secondary">🔍 Total queries made</p>
        <p className="mt-1 text-lg font-semibold text-text-primary">
          <Counter value={totalQueries} />
        </p>
      </div>
    </div>
  );
}
