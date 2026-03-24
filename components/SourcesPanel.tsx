"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface SourcesPanelProps {
  sources?: string[];
}

export default function SourcesPanel({ sources }: SourcesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-2 text-xs text-textSecondary transition hover:text-textPrimary"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>
          View Sources ({sources.length} {sources.length === 1 ? "source" : "sources"})
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded ? (
        <div className="mt-3 space-y-2">
          {sources.map((source, index) => (
            <div
              key={`${source}-${index}`}
              className="rounded-lg border border-border bg-bg/70 px-3 py-2 text-xs font-mono leading-relaxed text-textSecondary"
            >
              {source}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
