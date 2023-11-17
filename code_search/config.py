import os

from dotenv import load_dotenv

load_dotenv()

CODE_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.dirname(CODE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")

QDRANT_CODE_COLLECTION_NAME = "code-snippets-unixcoder"
QDRANT_NLU_COLLECTION_NAME = "code-signatures"
QDRANT_FILE_COLLECTION_NAME="code-files"

ENCODER_NAME = "all-MiniLM-L6-v2"
ENCODER_SIZE = 384
