import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

CODE_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.dirname(CODE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")

def _key_problem(value: str | None) -> str | None:
    """Describe why a key is unusable, or None when it looks fine.

    Non-ASCII keys are worth catching here: httpx raises UnicodeEncodeError
    deep inside header construction, which surfaces as an unrelated-looking
    stack trace. "<UNKNOWN>" is what some PaaS dashboards store when a
    variable was set from an unresolved reference.
    """
    if not value:
        return "QDRANT_API_KEY is not set"
    if value == "<UNKNOWN>":
        return "QDRANT_API_KEY is the literal string '<UNKNOWN>', so the variable never resolved"
    if len(value) < 20:
        return f"QDRANT_API_KEY is only {len(value)} characters, which is too short to be a key"
    try:
        value.encode("ascii")
    except UnicodeEncodeError:
        return "QDRANT_API_KEY contains non-ASCII characters, usually a copy-paste artifact"
    return None


QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")

# Fail at import with the actual reason rather than carrying on with a bad key.
# A silent fallback here hides a broken deploy variable and turns a one-line
# config error into an afternoon of debugging downstream symptoms.
if QDRANT_URL.startswith("https://"):
    _problem = _key_problem(QDRANT_API_KEY)
    if _problem:
        raise RuntimeError(
            f"{_problem}. A remote QDRANT_URL ({QDRANT_URL}) needs a valid API key. "
            "Set QDRANT_API_KEY in the environment."
        )

QDRANT_CODE_COLLECTION_NAME = "code-snippets-unixcoder"
QDRANT_NLU_COLLECTION_NAME = "code-signatures"
QDRANT_FILE_COLLECTION_NAME = "code-files"

ENCODER_NAME = "all-MiniLM-L6-v2"
ENCODER_SIZE = 384

# Commit of qdrant/qdrant the collections were built from. Result links carry
# line numbers, and resolving them against a moving `master` quietly points at
# the wrong lines as the source changes. Set this to the SHA the indexing run
# reports; `master` is the old behaviour and stays the default so an unset
# variable degrades to what it did before rather than breaking links.
INDEXED_COMMIT = os.environ.get("INDEXED_COMMIT", "master")


def make_qdrant_client() -> QdrantClient:
    """Construct a QdrantClient from QDRANT_URL.

    Explicit host/port/https params (instead of just `url=`) so we don't get
    caught by qdrant-client's URL parsing quirks — some Railway-like PaaS
    egress environments seem to fail on the client's default port assumptions,
    surfacing as "[Errno 111] Connection refused" even when the URL is
    reachable via curl.
    """
    parsed = urlparse(QDRANT_URL)
    https = parsed.scheme == "https"
    port = parsed.port or (443 if https else 6333)
    return QdrantClient(
        host=parsed.hostname,
        port=port,
        https=https,
        api_key=QDRANT_API_KEY,
        prefer_grpc=False,
        timeout=60,
    )
