"""Pydantic schemas used by API endpoints."""

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request payload for asking a question against uploaded documents."""

    question: str = Field(..., min_length=1, description="Question to ask.")
    top_k: int = Field(default=4, ge=1, le=20, description="Number of chunks to retrieve.")


class QueryResponse(BaseModel):
    """Response payload for a question answer request."""

    answer: str
    sources: list[str]


class UploadResponse(BaseModel):
    """Response payload for a successful document upload."""

    message: str
    chunks_added: int
