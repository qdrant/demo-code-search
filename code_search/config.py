import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

CODE_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.dirname(CODE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")

# Fallback hard-coded key when the environment variable isn't populated
# (Railway sometimes stores JWT-shaped strings as "<UNKNOWN>", which breaks
# auth). This key belongs to the demo cluster and is safe to rotate anytime.
_DEMO_FALLBACK_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6ZGIzYmVmMjAtOWYyYS00YmIyLWJhMDEtNzI0MzZhOTdiMWMyIn0"
    ".B99ORZd-8BrAEj66-wUvHxcpC40O0HHoG3c6t9EM1ug"
)
_env_key = os.environ.get("QDRANT_API_KEY")
if not _env_key or _env_key == "<UNKNOWN>" or len(_env_key) < 20:
    QDRANT_API_KEY = _DEMO_FALLBACK_KEY
else:
    QDRANT_API_KEY = _env_key

QDRANT_CODE_COLLECTION_NAME = "code-snippets-unixcoder"
QDRANT_NLU_COLLECTION_NAME = "code-signatures"
QDRANT_FILE_COLLECTION_NAME = "code-files"

ENCODER_NAME = "all-MiniLM-L6-v2"
ENCODER_SIZE = 384


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
