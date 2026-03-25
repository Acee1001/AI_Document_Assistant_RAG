"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, topK: number) => Promise<void>;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const [topK, setTopK] = useState(4);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 112)}px`;
  }, [value]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) {
      return;
    }
    setSending(true);
    setValue("");
    await onSend(trimmed, topK);
    setSending(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit(event);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="glass-card m-3 mt-2 space-y-3 p-3 sm:m-4"
      aria-label="Chat input form"
    >
      <div className="flex items-end gap-3">
        <label htmlFor="question-input" className="sr-only">
          Ask a question
        </label>
        <textarea
          ref={textareaRef}
          id="question-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything about your documents..."
          className="w-full resize-none rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-purple focus:outline-none"
          disabled={loading}
          rows={1}
          maxLength={500}
        />
        <button
          type="submit"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-gradient)] text-white shadow-[var(--glow-cyan)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || !value.trim()}
          aria-label="Send message"
        >
          <SendHorizontal className={`h-4 w-4 ${sending ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-text-secondary" htmlFor="topk-range">
          Retrieve 1-10 sources ({topK})
        </label>
        <span className="text-xs text-text-secondary">{value.length} / 500</span>
      </div>
      <input
        id="topk-range"
        type="range"
        min={1}
        max={10}
        value={topK}
        onChange={(event) => setTopK(Number(event.target.value))}
        className="w-full accent-cyan-500"
      />
    </form>
  );
}
