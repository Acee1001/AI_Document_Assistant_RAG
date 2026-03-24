"""Query endpoint for retrieval-augmented question answering."""

from fastapi import APIRouter

from models.schemas import QueryRequest, QueryResponse
from services.rag_chain import answer_question


router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def query_documents(payload: QueryRequest) -> QueryResponse:
    """Answer a user question using retrieved chunks from the FAISS index."""
    answer, sources = answer_question(payload.question, payload.top_k)
    return QueryResponse(answer=answer, sources=sources)
