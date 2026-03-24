"""Application configuration and environment settings."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


@dataclass
class Settings:
    """Store and validate application settings loaded from environment."""

    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    faiss_index_path: str = os.getenv("FAISS_INDEX_PATH", "storage/faiss_index")
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "500"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "50"))
    groq_model: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")

    def ensure_directories(self) -> None:
        """Create required local directories if they do not already exist."""
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
        Path(self.faiss_index_path).mkdir(parents=True, exist_ok=True)

    @property
    def faiss_parent(self) -> Path:
        """Return the parent directory used for FAISS index persistence."""
        return Path(self.faiss_index_path).parent


settings = Settings()
