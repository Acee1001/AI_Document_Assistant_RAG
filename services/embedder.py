"""Embedding and FAISS persistence utilities."""

from pathlib import Path

from fastapi import HTTPException
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from config import settings


_embeddings: HuggingFaceEmbeddings | None = None

def get_embeddings() -> HuggingFaceEmbeddings:
    """Return cached HuggingFace embeddings model, loading once on first call."""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
    return _embeddings

def _build_documents(chunks: list[str], source_name: str) -> list[Document]:
    """Convert raw text chunks into LangChain Document objects."""
    return [
        Document(page_content=chunk, metadata={"source": source_name, "chunk_id": idx})
        for idx, chunk in enumerate(chunks)
    ]


def save_or_append_faiss(chunks: list[str], source_name: str) -> int:
    """Save new chunks to FAISS, appending to existing index when available."""
    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks generated from file.")

    embeddings = get_embeddings()
    docs = _build_documents(chunks, source_name)
    index_dir = Path(settings.faiss_index_path)

    try:
        if (index_dir / "index.faiss").exists() and (index_dir / "index.pkl").exists():
            vector_store = FAISS.load_local(
                folder_path=str(index_dir),
                embeddings=embeddings,
                allow_dangerous_deserialization=True,
            )
            vector_store.add_documents(docs)
        else:
            vector_store = FAISS.from_documents(docs, embeddings)

        vector_store.save_local(str(index_dir))
        return len(docs)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update FAISS index: {exc}") from exc


def add_to_index(chunks: list[str], source_name: str = "uploaded_file") -> int:
    """Compatibility wrapper for adding chunks into the FAISS index."""
    return save_or_append_faiss(chunks, source_name)


def load_faiss() -> FAISS:
    """Load an existing FAISS vector store from disk."""
    index_dir = Path(settings.faiss_index_path)
    if not (index_dir / "index.faiss").exists() or not (index_dir / "index.pkl").exists():
        raise HTTPException(status_code=404, detail="No FAISS index found. Upload documents first.")

    try:
        embeddings = get_embeddings()
        return FAISS.load_local(
            folder_path=str(index_dir),
            embeddings=embeddings,
            allow_dangerous_deserialization=True,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load FAISS index: {exc}") from exc
