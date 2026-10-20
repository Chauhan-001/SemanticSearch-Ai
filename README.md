<div align="center">

# SemanticSearch AI

### Vector Embedding Search Engine with Cosine Similarity

A full-stack semantic search application that understands **meaning**, not just keywords.
Built with a three-tier architecture: **React-free Vite frontend** &rarr; **Node.js API gateway** &rarr; **Python ML service**.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![SentenceTransformers](https://img.shields.io/badge/SentenceTransformers-FF6F00?logo=huggingface&logoColor=white)](https://www.sbert.net/)

</div>

---

## What Is Semantic Search?

Traditional search matches **exact keywords**. If you search `"money back"` and a document says `"refund"`, keyword search finds nothing.

Semantic search uses **AI embeddings** to convert text into numerical vectors. Documents with similar *meaning* end up close together in vector space — even if they share no keywords.

```
Keyword search:   "money back"  vs  "refund"     → No match
Semantic search:  "money back"  vs  "refund"     → Score: 0.82 (strong match!)
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        SEARCH PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER INPUT                                                  │
│     User types a natural language query                         │
│     e.g. "How do I get my money back?"                          │
│              │                                                  │
│              ▼                                                  │
│  2. TEXT EMBEDDING                                              │
│     all-MiniLM-L6-v2 transformer converts text to a             │
│     384-dimensional numerical vector                            │
│              │                                                  │
│              ▼                                                  │
│  3. VECTOR COMPARISON                                           │
│     Cosine similarity measures the angle between the            │
│     query vector and every document vector                      │
│              │                                                  │
│              ▼                                                  │
│  4. RANKED RESULTS                                              │
│     Documents sorted by similarity score (0.0 to 1.0)           │
│     Higher score = more semantically similar                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cosine Similarity Formula

```
                A · B
    score = ─────────────
             ‖A‖ × ‖B‖

    Where A = query vector (384 dims)
          B = document vector (384 dims)
          · = dot product
          ‖·‖ = magnitude (L2 norm)
```

The score ranges from **0** (unrelated) to **1** (identical meaning).

---

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐
│   Frontend   │      │  Node.js API │      │    Python ML Service     │
│  (Vite :5173)│─────▶│  (Express    │─────▶│  (FastAPI :8000)         │
│              │      │   :3000)     │      │                          │
│  Vanilla JS  │      │  CORS proxy  │      │  SentenceTransformer     │
│  Dark theme  │      │  Validation  │      │  sklearn cosine_sim      │
│  Live results│      │  Rate guard  │      │  NumPy vector store      │
└──────────────┘      └──────────────┘      └──────────────────────────┘
```

| Layer | Technology | Port | Role |
|-------|-----------|------|------|
| **Frontend** | Vite + Vanilla JS | `:5173` | UI, search bar, results display |
| **Gateway** | Node.js + Express | `:3000` | CORS handling, request validation, proxy |
| **ML Service** | Python + FastAPI | `:8000` | Embeddings, similarity computation |

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **ML Model** | `all-MiniLM-L6-v2` | 384-dim sentence embeddings |
| **Embeddings** | SentenceTransformers | Text to vector conversion |
| **Similarity** | Scikit-learn | Cosine similarity computation |
| **Vector Ops** | NumPy | Efficient matrix operations |
| **API Server** | FastAPI + Uvicorn | High-performance Python API |
| **Gateway** | Node.js + Express | Request proxying and validation |
| **Frontend** | Vite + Vanilla JS | Static site with live search |
| **Validation** | Pydantic | Request/response validation |

---

## Project Structure

```
SemanticSearchAi/
├── frontend/                    # Vite frontend (:5173)
│   ├── index.html               # Main HTML with search UI
│   ├── src/
│   │   ├── main.js              # Search logic, API calls, DOM
│   │   └── style.css            # Dark theme, animations, responsive
│   └── package.json
│
├── backend/                     # Node.js API gateway (:3000)
│   ├── server.js                # Express server, CORS, proxy
│   └── package.json
│
├── python-service/              # Python ML service (:8000)
│   ├── main.py                  # FastAPI app, endpoints, validation
│   ├── search.py                # SemanticSearch class, embeddings
│   └── test_search.py           # Unit tests (7 tests)
│
└── README.md
```

---

## Getting Started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

### Installation

**1. Python ML Service**

```bash
cd python-service
pip install fastapi uvicorn sentence-transformers scikit-learn numpy
```

**2. Node.js Gateway**

```bash
cd backend
npm install
```

**3. Frontend**

```bash
cd frontend
npm install
```

### Run the Application

Open **three terminals** and run:

```bash
# Terminal 1 — Python ML service (start first, loads the model)
cd python-service
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Node.js API gateway
cd backend
node server.js

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## API Reference

### Python Service (`:8000`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | Health check + document count |
| `POST` | `/search` | `{"query": "...", "top_k": 3}` | Semantic search |
| `GET` | `/documents` | — | List all indexed documents |
| `POST` | `/documents` | `{"documents": ["...", "..."]}` | Add documents to index |
| `DELETE` | `/documents` | — | Clear all documents |

### Node Gateway (`:3000`)

All endpoints proxy to the Python service:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Gateway health check |
| `POST` | `/search` | Proxy to Python `/search` |
| `GET` | `/documents` | Proxy to Python `/documents` |
| `POST` | `/documents` | Proxy to Python `/documents` |
| `DELETE` | `/documents` | Proxy to Python `/documents` |

### Example Requests

**Search:**
```bash
curl -X POST http://127.0.0.1:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I get my money back?", "top_k": 3}'
```

**Response:**
```json
{
  "query": "How do I get my money back?",
  "results": [
    {
      "text": "Sometime refunds can be late due to technical problem.",
      "score": 0.6062
    },
    {
      "text": "Refunds are processed within five business days.",
      "score": 0.5372
    },
    {
      "text": "Customers receive their money back within a week.",
      "score": 0.4476
    }
  ],
  "elapsed_ms": 12.4,
  "model": "all-MiniLM-L6-v2",
  "dimensions": 384
}
```

**Add Documents:**
```bash
curl -X POST http://127.0.0.1:8000/documents \
  -H "Content-Type: application/json" \
  -d '{"documents": ["Gift cards are valid for one year."]}'
```

---

## Running Tests

```bash
cd python-service
python -m pytest test_search.py -v
```

**Test coverage (7 tests):**
- Relevant document ranks first
- Empty query rejected with `ValueError`
- Empty document list returns no results
- `top_k` limits result count
- `top_k=0` returns empty list
- `top_k` larger than document count returns all
- Documents added correctly

---

## Key Concepts Learned

### 1. Sentence Embeddings
Text is converted to a fixed-size numerical vector (384 dimensions for MiniLM). Similar meanings produce similar vectors, enabling semantic understanding beyond keyword matching.

### 2. Cosine Similarity
Measures the cosine of the angle between two vectors. Unlike Euclidean distance, it captures directional similarity — ideal for comparing text embeddings regardless of magnitude.

### 3. Vector Store Efficiency
Document embeddings are computed **once** at startup. New documents are embedded and **appended** with `np.concatenate` without recomputing old vectors — keeping operations O(n) for additions.

### 4. Three-Tier Architecture
Separating frontend, gateway, and ML service allows independent scaling. The Node gateway handles CORS and validation, while Python focuses on ML inference.

### 5. CORS Handling
Browsers block cross-origin requests by default. The Python service uses `CORSMiddleware` and the Node gateway sets `Access-Control-Allow-*` headers to permit frontend communication.

### 6. Pydantic Validation
FastAPI's Pydantic models validate requests at the schema level with `@field_validator`, catching empty queries and blank documents before they reach the search engine.

---

## Performance

| Metric | Value |
|--------|-------|
| Embedding dimensions | 384 |
| Model size | ~90MB |
| Search latency | ~10-50ms |
| Model load time | ~2-5s (first run) |
| Max documents (in-memory) | Thousands |

---

## Screenshots

The UI features a dark theme with:
- **Live search** with animated score bars
- **Document manager** for adding/removing documents in real time
- **Architecture visualization** showing the three-tier pipeline
- **Search latency** and metadata display

---

## Future Improvements

- [ ] Persistent vector database (ChromaDB / FAISS)
- [ ] User authentication and multi-tenant search
- [ ] Batch document upload via CSV/JSON files
- [ ] Search result highlighting and snippets
- [ ] Deploy to cloud (Docker + AWS/GCP)
- [ ] Rate limiting and request caching
- [ ] WebSocket for real-time search suggestions

---

<div align="center">

**Built to demonstrate semantic search concepts: vector embeddings, cosine similarity, and full-stack AI application development.**

</div>
