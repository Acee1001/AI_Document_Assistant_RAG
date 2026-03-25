import type { QueryResponse, UploadResponse } from "@/types";

const API_BASE = "http://127.0.0.1:8000";

const parseErrorText = async (res: Response): Promise<string> => {
  const text = await res.text();
  return text || "Request failed";
};

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData
    });
  } catch {
    throw new Error("Cannot reach backend server.");
  }

  if (!res.ok) {
    throw new Error(await parseErrorText(res));
  }

  return (await res.json()) as UploadResponse;
}

export async function queryDocument(question: string, topK = 4): Promise<QueryResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: topK })
    });
  } catch {
    throw new Error("Cannot reach backend server.");
  }

  if (!res.ok) {
    throw new Error(await parseErrorText(res));
  }
  return (await res.json()) as QueryResponse;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
