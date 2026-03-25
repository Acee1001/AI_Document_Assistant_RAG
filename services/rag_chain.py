"""RAG chain construction and query execution helpers."""

from fastapi import HTTPException
from langchain_groq import ChatGroq

from config import settings
from services.embedder import load_faiss


SYSTEM_PROMPT = (
    "You are a helpful assistant. Answer only from the provided context. "
    "If the answer is not in the context, say I don't know based on the provided documents."
)


def answer_question(question: str, top_k: int) -> tuple[str, list[str]]:
    """Retrieve context and generate a grounded answer for a question."""
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty.")
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    vector_store = load_faiss()

    try:
        docs = vector_store.similarity_search(question, k=top_k)
        if not docs:
            return ("I don't know based on the provided documents.", [])

        context_blocks = [doc.page_content for doc in docs]
        context = "\n\n".join(context_blocks)
        user_prompt = f"Context:\n{context}\n\nQuestion: {question}"

        llm = ChatGroq(
            groq_api_key=settings.groq_api_key,
            model_name=settings.groq_model,
            temperature=0,
        )
        response = llm.invoke(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]
        )
        answer = response.content if isinstance(response.content, str) else str(response.content)
        return answer, context_blocks
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to run RAG query: {exc}") from exc
