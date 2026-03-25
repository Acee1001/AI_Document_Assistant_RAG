# LLM RAG Pipeline - Document Q&A System

This project is a complete Retrieval-Augmented Generation (RAG) API built with FastAPI, LangChain, FAISS, local HuggingFace embeddings, and Groq for answer generation.

It supports:
- Uploading `.pdf`, `.txt`, `.docx`, and `.zip` files
- Chunking and embedding document text
- Storing vectors in a local FAISS index
- Asking questions grounded in uploaded documents

## Tech Stack

- FastAPI (backend)
- LangChain (RAG orchestration)
- FAISS (local vector store)
- Groq via `langchain-groq` (LLM provider)
- HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (embeddings)
- PyMuPDF (PDF parsing)

## Folder Structure

```text
rag-pipeline/
├── main.py
├── config.py
├── requirements.txt
├── .env.example
├── routers/
│   ├── upload.py
│   └── query.py
├── services/
│   ├── document_loader.py
│   ├── chunker.py
│   ├── embedder.py
│   └── rag_chain.py
├── models/
│   └── schemas.py
├── storage/
│   └── faiss_index/
└── uploads/
```

## Setup

1. Create and activate a Python 3.10+ virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create your `.env` file from the example:

```bash
cp .env.example .env
```

4. Set `GROQ_API_KEY` in `.env`.

## Run the App

From the `rag-pipeline` directory:

```bash
uvicorn main:app --reload
```

The app auto-creates `uploads/` and `storage/faiss_index/` on startup.

## API Endpoints

### Health Check

`GET /health`

Response:

```json
{
  "status": "ok"
}
```

### Upload Document

`POST /upload`

Accepts multipart file upload (`.pdf`, `.txt`, `.docx`, or `.zip`).

Example curl:

```bash
curl -X POST "http://127.0.0.1:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.pdf"
```

Example response:

```json
{
  "message": "Uploaded successfully",
  "chunks_added": 18
}
```

### Query Documents

`POST /query`

Request JSON:

```json
{
  "question": "What does the document say about refunds?",
  "top_k": 4
}
```

Example curl:

```bash
curl -X POST "http://127.0.0.1:8000/query" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What does the document say about refunds?\",\"top_k\":4}"
```

Example response:

```json
{
  "answer": "The refund policy states that ...",
  "sources": [
    "chunk text 1...",
    "chunk text 2..."
  ]
}
```

## Notes

- The assistant is instructed to answer only from retrieved context.
- If the answer is not present, it returns: `I don't know based on the provided documents.`
- No API keys are hardcoded; values are loaded from `.env`.
