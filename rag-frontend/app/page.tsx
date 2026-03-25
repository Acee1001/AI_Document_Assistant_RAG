"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { BrainCircuit, TriangleAlert } from "lucide-react";
import { FiArrowDown } from "react-icons/fi";

import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import TerminalDemo from "@/components/TerminalDemo";
import CustomCursor from "@/components/CustomCursor";
import ChatInput from "@/components/ChatInput";
import ChatWindow from "@/components/ChatWindow";
import FileUpload from "@/components/FileUpload";
import StatsBar from "@/components/StatsBar";
import { healthCheck, queryDocument, uploadFiles } from "@/lib/api";
import type { FileResult, Message, UploadedFile, UploadResponse } from "@/types";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const heroText = "Chat With Your Documents";

export default function HomePage() {
  const [typed, setTyped] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [querying, setQuerying] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<FileResult[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [totalQueries, setTotalQueries] = useState(0);

  const canChat = uploadedFiles.length > 0;
  const uploadSummary = useMemo(
    () =>
      `${uploadResults.length} files • ${uploadResults.reduce(
        (sum, item) => sum + item.chunks_added,
        0
      )} chunks added to knowledge base`,
    [uploadResults]
  );

  useEffect(() => {
    let idx = 0;
    const interval = window.setInterval(() => {
      idx += 1;
      setTyped(heroText.slice(0, idx));
      if (idx >= heroText.length) {
        window.clearInterval(interval);
        setTimeout(() => setShowSubtitle(true), 260);
      }
    }, 70);
    return () => window.clearInterval(interval);
  }, []);

  const openToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleUploadAll = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    const progressSeed: Record<string, number> = {};
    files.forEach((file) => {
      progressSeed[file.name] = 0;
    });
    setProgress(progressSeed);
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = Math.min(95, next[key] + 10);
        }
        return next;
      });
    }, 180);

    try {
      const response: UploadResponse = await uploadFiles(files);
      setUploadResults(response.results);
      setTotalChunks((prev) => prev + response.total_chunks_added);
      const successFiles = response.results
        .filter((item) => item.status === "success")
        .map((item) => {
          const ext = item.filename.slice(item.filename.lastIndexOf(".")).toLowerCase();
          return {
            name: item.filename,
            chunks: item.chunks_added,
            type: ext,
            uploadedAt: new Date()
          };
        });
      setUploadedFiles((prev) => [...successFiles, ...prev]);
      setSelectedFiles([]);
      setProgress((prev) => {
        const done = { ...prev };
        for (const key of Object.keys(done)) done[key] = 100;
        return done;
      });
    } catch (error) {
      openToast(error instanceof Error ? error.message : "Upload failed.");
      setUploadResults([]);
    } finally {
      window.clearInterval(timer);
      setUploading(false);
    }
  };

  const handleSend = async (question: string, topK: number) => {
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: question,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuerying(true);

    try {
      const healthy = await healthCheck();
      if (!healthy) {
        openToast("Backend is unavailable. Please start the API server.");
      }
      const response = await queryDocument(question, topK);
      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTotalQueries((prev) => prev + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not get an answer right now.";
      openToast(message);
      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: "I couldn't reach the backend right now. Please try again in a moment.",
        timestamp: new Date(),
        sources: []
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setQuerying(false);
    }
  };

  const featureCards = [
    {
      title: "Instant document AI",
      text: "Upload PDFs and docs, get instant answers with semantic search and embeddings.",
      icon: "🧠"
    },
    {
      title: "Auto chunking",
      text: "Automatically splits documents into knowledge chunks for efficient retrieval.",
      icon: "📄"
    },
    {
      title: "Source-aware answers",
      text: "Answers include provenance links using file references and chunk IDs.",
      icon: "🔍"
    }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02020a] text-text-primary">
      <ParticleBackground />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <CustomCursor />
      <Navbar />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-24 sm:px-6 lg:flex-row lg:py-28">
        <div className="lg:w-5/12">
          <motion.h1
            className="mb-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-transparent bg-gradient-to-r from-[#6c63ff] via-[#8f8cff] to-[#00d4ff] bg-clip-text">
              {typed}
              <span className="ml-1 inline-block h-[1.2em] w-1 animate-[blink_0.8s_steps(2)_infinite] bg-cyan-300" />
            </span>
          </motion.h1>
          <motion.p
            className={`mb-6 max-w-xl text-base text-text-secondary ${showSubtitle ? "opacity-100" : "opacity-0"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: showSubtitle ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Bring your knowledge base to life with AI-powered retrieval and conversational guidance across any document.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="#features"
              className="rounded-lg border border-[#6c63ff]/30 bg-gradient-to-r from-[#6c63ff]/75 via-[#7f82ff]/40 to-[#00d4ff]/50 px-6 py-3 font-semibold text-white shadow-lg shadow-[#6c63ff]/40 transition hover:scale-[1.02] hover:shadow-[#00d4ff]/60"
            >
              Start Uploading
            </a>
            <a
              href="#see-it"
              className="rounded-lg border border-white/25 bg-[#13131a]/70 px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-cyan-400 hover:text-white"
            >
              Watch Demo
            </a>
          </motion.div>

          <motion.div
            className="mt-12 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="glass-card animate-float p-3 text-xs shadow-2xl">
              <p className="text-text-secondary">📄 research_paper.pdf — 45 chunks added ✅</p>
            </div>
            <div className="glass-card animate-float p-3 text-xs shadow-2xl" style={{ animationDuration: "3s" }}>
              <p className="text-text-secondary">💬 What are the key findings? → The study found that...</p>
            </div>
            <div className="glass-card animate-float p-3 text-xs shadow-2xl" style={{ animationDuration: "3.8s" }}>
              <p className="text-text-secondary">📚 3 Sources found</p>
            </div>
          </motion.div>

          <div className="mt-10">
            <span className="flex items-center gap-2 text-xs text-text-secondary">
              <FiArrowDown className="animate-bounce-dots" />
              Scroll to explore
            </span>
          </div>
        </div>

        <motion.div
          className="relative hidden overflow-hidden rounded-2xl border border-white/15 bg-[#0f1220]/70 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.4)] lg:block lg:w-7/12"
          initial={{ opacity: 0, x: 70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute -right-12 -top-16 h-[260px] w-[260px] opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80"
              alt="AI technology"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
          <div className="relative z-10 h-[420px] overflow-hidden rounded-xl border border-white/20 bg-[#0f1220]/75 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-text-secondary">RAG Chat Live</span>
              <span className="text-xs text-text-secondary">42s elapsed</span>
            </div>
            <div className="h-full space-y-2 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="rounded-lg bg-[#16182d] p-3 text-sm"
              >
                <p className="text-text-secondary">Uploading research_paper.pdf ...</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="rounded-lg bg-[#121429] p-3 text-sm"
              >
                <p className="text-white">User: What are the key insights?</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="rounded-lg bg-[#0d0f1f] p-3 text-sm"
              >
                <p className="text-cyan-300">AI: The study highlights...</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.h2
          className="mb-8 text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Features
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature, idx) => (
            <motion.article
              key={feature.title}
              className="glass-card border-solid border-white/15 p-6 transition hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,212,255,0.35)]"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
            >
              <p className="mb-3 text-lg">{feature.icon}</p>
              <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-text-secondary">{feature.text}</p>
              <a className="mt-3 inline-flex items-center gap-1 text-cyan-300 opacity-0 transition-all hover:opacity-100" href="#">
                Learn more →
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.h2
          className="mb-8 text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>
        <div className="space-y-4">
          {[
            "Upload your documents",
            "System preprocesses and chunks",
            "Create embeddings and store in vector index",
            "Ask questions and get source grounded answers"
          ].map((step, idx) => (
            <motion.div
              key={step}
              className="glass-card border border-white/10 p-5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
            >
              <strong className="text-cyan-300">Step {idx + 1}:</strong> {step}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="use-cases" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.h2
          className="mb-8 text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Use Cases
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Research summaries",
            "Legal due diligence",
            "Sales enablement",
            "Training manuals"
          ].map((item, idx) => (
            <motion.div
              key={item}
              className="glass-card border border-white/15 p-5"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white">{item}</h3>
              <p className="text-text-secondary">AI-driven document answers for smart teams.</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="see-it" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.h2
          className="mb-8 text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          See It In Action
        </motion.h2>
        <TerminalDemo />
      </section>

      <section id="faq" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <motion.h2
          className="mb-8 text-3xl font-bold text-white sm:text-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          FAQ
        </motion.h2>
        <div className="space-y-3">
          {[
            "How secure is my data?",
            "Can I upload multiple file types?",
            "How does the vector search work?"
          ].map((q, idx) => (
            <motion.div
              key={q}
              className="glass-card border border-white/10 p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
            >
              <strong className="text-white">{q}</strong>
              <p className="text-text-secondary">Ans: Lorem ipsum condensed answer for clarity.</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:pb-24">
        <div className="relative z-10 mx-auto flex min-h-[calc(42vh)] w-full max-w-7xl flex-col gap-4 rounded-2xl border border-white/15 bg-[#101123]/80 p-5 shadow-[0_12px_42px_rgba(0,0,0,0.4)] backdrop-blur-lg lg:flex-row">
          <aside className="glass-card flex w-full flex-col gap-4 p-5 lg:w-[35%]">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
                <BrainCircuit className="h-6 w-6 text-accent-cyan" />
                RAG Chat
              </h1>
              <p className="mt-1 text-sm text-text-secondary">Upload, index, and chat with your files</p>
            </div>

            <StatsBar
              totalFiles={uploadedFiles.length}
              totalChunks={totalChunks}
              totalQueries={totalQueries}
            />

            <FileUpload
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              onUploadAll={handleUploadAll}
              uploadResults={uploadResults}
              uploading={uploading}
              progress={progress}
              uploadedHistory={uploadedFiles}
              summary={uploadSummary}
            />
          </aside>

          <section className="glass-card flex h-[64vh] w-full flex-col overflow-hidden lg:h-auto lg:w-[65%]">
            <ChatWindow messages={messages} isLoading={querying} />
            <ChatInput onSend={handleSend} loading={querying || !canChat} />
            {!canChat ? (
              <div className="px-4 pb-4 text-xs text-text-secondary">
                Upload at least one document to start chatting.
              </div>
            ) : null}
          </section>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-30 max-w-sm rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-red-100 shadow-lg backdrop-blur-sm">
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{toast}</span>
          </p>
        </div>
      ) : null}
    </main>
  );
}

