"""FastAPI entrypoint for the RAG pipeline application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers.query import router as query_router
from routers.upload import router as upload_router

app = FastAPI(title="LLM RAG Pipeline", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize required application directories on startup."""
    settings.ensure_directories()


@app.get("/health")
async def health() -> dict:
    """Return a basic application health response."""
    return {"status": "ok"}


app.include_router(upload_router)
app.include_router(query_router)