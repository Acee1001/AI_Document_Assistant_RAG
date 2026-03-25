"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, Trash2, X } from "lucide-react";
import type { FileResult, UploadedFile } from "@/types";

interface FileUploadProps {
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  onUploadAll: (files: File[]) => Promise<void>;
  uploadResults: FileResult[];
  uploading: boolean;
  progress: Record<string, number>;
  uploadedHistory: UploadedFile[];
  summary: string;
}

const ACCEPTED = new Set([".pdf", ".txt", ".docx", ".zip"]);

const extIcon = (name: string): string => {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "📄";
  if (ext === ".txt") return "📝";
  if (ext === ".docx") return "📘";
  if (ext === ".zip") return "🗜️";
  return "📎";
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function FileUpload({
  selectedFiles,
  setSelectedFiles,
  onUploadAll,
  uploadResults,
  uploading,
  progress,
  uploadedHistory,
  summary
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter((file) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return ACCEPTED.has(ext);
    });
    const existing = new Set(selectedFiles.map((file) => `${file.name}-${file.size}`));
    const merged = [...selectedFiles];
    for (const file of incoming) {
      const key = `${file.name}-${file.size}`;
      if (!existing.has(key)) {
        merged.push(file);
      }
    }
    setSelectedFiles(merged);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const onBrowse = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const removeFile = (target: File) => {
    setSelectedFiles(
      selectedFiles.filter((file) => !(file.name === target.name && file.size === target.size))
    );
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          isDragActive
            ? "border-accent-purple bg-accent-purple/10 shadow-[var(--glow-purple)]"
            : "border-border bg-white/5 hover:border-accent-purple/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.docx,.zip"
          multiple
          onChange={onBrowse}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mx-auto flex flex-col items-center gap-2 text-text-secondary"
        >
          <FileUp className={`h-10 w-10 ${isDragActive ? "animate-bounce" : "animate-float"}`} />
          <span className="text-sm font-medium">Drop files here or click to browse</span>
          <span className="text-xs">.pdf .txt .docx .zip</span>
        </button>
      </div>

      <div className="glass-card p-3">
        <p className="mb-2 text-sm font-semibold text-text-primary">Selected files</p>
        <ul className="max-h-48 space-y-2 overflow-auto pr-1">
          {selectedFiles.length === 0 ? (
            <li className="text-sm text-text-secondary">No files selected yet.</li>
          ) : (
            selectedFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card/60 px-3 py-2"
              >
                <span className="min-w-0 text-sm text-text-primary">
                  <span className="mr-2">{extIcon(file.name)}</span>
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 text-xs text-text-secondary">{formatSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="rounded-md p-1 text-text-secondary hover:bg-white/10 hover:text-error"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <button
        type="button"
        disabled={uploading || selectedFiles.length === 0}
        onClick={() => void onUploadAll(selectedFiles)}
        className="w-full rounded-xl bg-[var(--accent-gradient)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--glow-purple)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload All Files"}
      </button>

      {selectedFiles.length > 0 ? (
        <div className="space-y-2">
          {selectedFiles.map((file) => (
            <div key={`progress-${file.name}-${file.size}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="truncate">{file.name}</span>
                <span>{progress[file.name] ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[var(--accent-gradient)] transition-all duration-300"
                  style={{ width: `${progress[file.name] ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {uploadResults.length > 0 ? (
        <div className="glass-card p-3">
          <p className="mb-2 text-sm font-semibold text-text-primary">Upload results</p>
          <ul className="space-y-2 text-sm">
            {uploadResults.map((result) => (
              <li key={`${result.filename}-${result.status}`} className="text-text-secondary">
                {result.status === "success" ? "✅" : "❌"} {result.filename} -{" "}
                {result.status === "success"
                  ? `${result.chunks_added} chunks added`
                  : result.error || "Upload failed"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-primary">{summary}</p>
        </div>
      ) : null}

      <div className="glass-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">Uploaded files history</p>
          <Trash2 className="h-4 w-4 text-text-secondary" />
        </div>
        <ul className="max-h-48 space-y-2 overflow-auto pr-1">
          {uploadedHistory.length === 0 ? (
            <li className="text-sm text-text-secondary">No uploads yet.</li>
          ) : (
            uploadedHistory.map((file) => (
              <li
                key={`${file.name}-${file.uploadedAt.toISOString()}`}
                className="rounded-lg border border-border bg-bg-card/60 px-3 py-2 text-sm text-text-secondary"
              >
                <span className="mr-2">{extIcon(file.name)}</span>
                {file.name} - {file.chunks} chunks
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
