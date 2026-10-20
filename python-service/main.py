from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import time
import numpy as np

from search import SemanticSearch

app = FastAPI(title="SemanticSearch AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=3, ge=1, le=20)

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Query cannot be empty or whitespace")
        return value


class AddDocumentsRequest(BaseModel):
    documents: list[str] = Field(min_length=1)

    @field_validator("documents")
    @classmethod
    def documents_must_not_be_blank(cls, value: list[str]) -> list[str]:
        if any(not document.strip() for document in value):
            raise ValueError("Documents cannot be empty or whitespace")
        return value


documents = [
    "Refunds are processed within five business days.",
    "Customers receive their money back within a week.",
    "Pizza and burgers are available on the menu.",
    "Sometime refunds can be late due to technical problem.",
]

search_engine = SemanticSearch(documents)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "documents": len(search_engine.documents),
    }


@app.options("/search")
def options_search():
    return {}


@app.post("/search")
def search_documents(request: SearchRequest):
    start = time.perf_counter()

    results = search_engine.search(
        request.query,
        top_k=request.top_k,
    )

    elapsed = time.perf_counter() - start

    return {
        "query": request.query,
        "results": results,
        "elapsed_ms": round(elapsed * 1000, 1),
        "model": "all-MiniLM-L6-v2",
        "dimensions": 384,
    }


@app.post("/documents")
def add_documents(request: AddDocumentsRequest):
    try:
        added_count = search_engine.add_documents(request.documents)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return {
        "message": "Documents added successfully",
        "added_count": added_count,
        "documents": search_engine.documents,
    }


@app.get("/documents")
def list_documents():
    return {
        "documents": search_engine.documents,
        "count": len(search_engine.documents),
    }


@app.delete("/documents")
def clear_documents():
    search_engine.documents.clear()
    search_engine.document_vectors = np.array([])
    return {
        "message": "All documents cleared",
        "count": 0,
    }
