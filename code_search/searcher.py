from qdrant_client import QdrantClient

from code_search.config import QDRANT_URL, QDRANT_API_KEY


class CodeSearcher:

    def __init__(self, collection_name):
        self.collection_name = collection_name
        self.client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    def search(self, query, limit=10):
        pass
