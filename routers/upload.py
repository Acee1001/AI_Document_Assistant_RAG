"""Upload endpoint for ingesting documents into the vector index."""

import os
import shutil
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from config import settings
from services.chunker import split_text
from services.document_loader import load_document
from services.embedder import add_to_index


router = APIRouter(tags=["upload"])
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".zip"}


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)) -> dict:
    """Upload one or more files, chunk contents, and append chunks to the FAISS index."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    results: list[dict[str, str | int]] = []
    total_chunks = 0

    for file in files:
        if not file.filename:
            results.append(
                {
                    "filename": "",
                    "status": "error",
                    "chunks_added": 0,
                    "error": "Missing filename."
                }
            )
            continue

        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            results.append(
                {
                    "filename": file.filename,
                    "status": "error",
                    "chunks_added": 0,
                    "error": (
                        f"Unsupported file type: {ext}. Allowed: .pdf, .txt, .docx, .zip"
                    )
                }
            )
            continue

        file_path = Path(settings.upload_dir) / Path(file.filename).name
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            text = load_document(str(file_path))
            chunks = split_text(
                text,
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap
            )
            add_to_index(chunks, source_name=file_path.name)
            total_chunks += len(chunks)
            results.append(
                {
                    "filename": file.filename,
                    "status": "success",
                    "chunks_added": len(chunks),
                    "error": ""
                }
            )
        except Exception as exc:
            results.append(
                {
                    "filename": file.filename,
                    "status": "error",
                    "chunks_added": 0,
                    "error": str(exc)
                }
            )

    return {
        "message": "Upload complete",
        "files_processed": len(files),
        "total_chunks_added": total_chunks,
        "results": results
    }
