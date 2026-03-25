export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

export interface FileResult {
  filename: string;
  status: "success" | "error";
  chunks_added: number;
  error?: string;
}

export interface UploadResponse {
  message: string;
  files_processed: number;
  total_chunks_added: number;
  results: FileResult[];
}

export interface QueryResponse {
  answer: string;
  sources: string[];
}

export interface UploadedFile {
  name: string;
  chunks: number;
  type: string;
  uploadedAt: Date;
}
