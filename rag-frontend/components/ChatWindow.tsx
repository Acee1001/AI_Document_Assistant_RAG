"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, User } from "lucide-react";
import type { Message } from "@/types";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const relativeTime = (date: Date): string => {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const AnimatedText = ({ text }: { text: string }) => {
  const [rendered, setRendered] = useState("");
  useEffect(() => {
    let i = 0;
    setRendered("");
    const timer = window.setInterval(() => {
      i += 1;
      setRendered(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, 9);
    return () => window.clearInterval(timer);
  }, [text]);
  return <span>{rendered}</span>;
};

const SourcesPanel = ({ sources }: { sources?: string[] }) => {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-text-secondary transition hover:text-text-primary"
      >
        📚 {sources.length} Sources
      </button>
      {open ? (
        <div className="mt-2 space-y-2">
          {sources.map((source, index) => (
            <div
              key={`${source}-${index}`}
              className="rounded-lg border border-border bg-bg-card/60 p-3 font-mono text-xs text-text-secondary"
            >
              <p className="mb-1 border-l-2 border-accent-cyan pl-2 text-text-primary">
                Source {index + 1}
              </p>
              {source}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const ordered = useMemo(() => [...messages], [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-text-secondary">
            <div
              className="mb-4 rounded-full border border-border bg-white/5 p-5 text-5xl shadow-[var(--glow-purple)] animate-pulse-glow"
              aria-hidden
            >
              🧠📄
            </div>
            <p className="text-lg font-semibold text-text-primary">Upload documents and start chatting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordered.map((message) => {
              const isUser = message.role === "user";
              return (
                <article
                  key={message.id}
                  className={`${isUser ? "ml-auto max-w-[85%] text-right animate-slide-in-right" : "mr-auto max-w-[90%] animate-slide-in-left"}`}
                >
                  <div
                    className={`mb-1 flex items-center gap-2 text-xs text-text-secondary ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser ? <Bot className="h-3.5 w-3.5 text-accent-cyan drop-shadow-[var(--glow-cyan)]" /> : null}
                    <span>{relativeTime(message.timestamp)}</span>
                    {isUser ? <User className="h-3.5 w-3.5 text-accent-purple" /> : null}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-[#6c63ff] to-[#a855f7] text-white"
                        : "border border-cyan-400/20 bg-white/5 text-text-primary backdrop-blur-md shadow-[var(--glow-cyan)]"
                    }`}
                  >
                    {isUser ? message.content : <AnimatedText text={message.content} />}
                  </div>
                  {!isUser ? <SourcesPanel sources={message.sources} /> : null}
                </article>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="mt-4 mr-auto w-fit rounded-2xl border border-border bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-bounce-dots rounded-full bg-accent-cyan shadow-[var(--glow-cyan)] [animation-delay:0s]" />
              <span className="h-2 w-2 animate-bounce-dots rounded-full bg-accent-cyan shadow-[var(--glow-cyan)] [animation-delay:0.2s]" />
              <span className="h-2 w-2 animate-bounce-dots rounded-full bg-accent-cyan shadow-[var(--glow-cyan)] [animation-delay:0.4s]" />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}
