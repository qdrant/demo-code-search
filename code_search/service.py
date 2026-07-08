import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from code_search.config import DATA_DIR, ROOT_DIR
from code_search.get_file import FileGet
from code_search.searcher import CombinedSearcher

app = FastAPI()

# CORS_ORIGINS is a comma-separated allowlist of frontend origins allowed to
# call this API. Use "*" only when the backend is public and stateless.
# Example: "https://code-search.vercel.app,https://staging.example.com"
cors_origins = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "").split(",")
    if o.strip()
]
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

searcher = CombinedSearcher()
get_file = FileGet()


def _load_fallback_index() -> list[dict]:
    """Load rust-parser structures for keyword fallback.

    Used only while the unixcoder embeddings collection is still building.
    Returns [] if the file isn't there, which disables the fallback.
    """
    path = Path(DATA_DIR) / "structures.json"
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


_FALLBACK_INDEX = _load_fallback_index()


def _keyword_search(query: str, limit: int = 5) -> list[dict]:
    """Rank structures by number of query-token hits across name, signature,
    docstring, and file path. Naive but good enough while embeddings build."""
    tokens = [t for t in query.lower().split() if t]
    if not tokens or not _FALLBACK_INDEX:
        return []

    scored = []
    for rec in _FALLBACK_INDEX:
        haystack = " ".join(
            filter(
                None,
                [
                    rec.get("name") or "",
                    rec.get("signature") or "",
                    rec.get("docstring") or "",
                    (rec.get("context") or {}).get("file_path") or "",
                    (rec.get("context") or {}).get("snippet") or "",
                ],
            )
        ).lower()
        score = sum(haystack.count(t) for t in tokens)
        if score:
            scored.append((score, rec))

    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for _score, rec in scored[:limit]:
        rec = dict(rec)
        rec["sub_matches"] = [
            {"overlap_from": rec.get("line_from") or 0, "overlap_to": rec.get("line_to") or 0}
        ]
        results.append(rec)
    return results


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Both handlers are plain `def` on purpose: the encoders and Qdrant client
# calls are blocking, so FastAPI runs them in its thread pool instead of
# blocking the event loop.
@app.get("/api/search")
def search(query: str):
    try:
        return {"result": searcher.search(query, limit=5)}
    except Exception as exc:
        # Collection not built yet — fall back to keyword ranking so the
        # frontend stays usable during the initial indexing run.
        message = str(exc)
        if "doesn't exist" in message or "Not found" in message or "404" in message:
            return {"result": _keyword_search(query, limit=5), "mode": "keyword"}
        raise HTTPException(status_code=500, detail=message)


@app.get("/api/file")
def file(path: str):
    return {
        "result": get_file.get(path)
    }


# Serve the built frontend when it's alongside the backend (self-hosted mode).
# In split deployments (Vercel + Railway) frontend/dist isn't present and we
# skip this mount so the API returns clean 404s for non-/api paths.
_dist_dir = os.path.join(ROOT_DIR, "frontend", "dist")
if os.path.isdir(_dist_dir):
    app.mount("/", StaticFiles(directory=_dist_dir, html=True))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
    )
