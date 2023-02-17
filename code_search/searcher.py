import json
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.models import ScoredPoint

from code_search.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION_NAME
from code_search.model.encoder import UniXcoderEmbeddingsProvider


class CodeSearcher:

    def __init__(self, collection_name):
        self.collection_name = collection_name
        self.client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        self.encoder = UniXcoderEmbeddingsProvider("cpu")

    def search(self, query, limit=5) -> List[dict]:
        vector = self.encoder.embed_code(docstring=query)
        result = self.client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
        )

        return [hit.payload for hit in result]


if __name__ == '__main__':
    searcher = CodeSearcher(QDRANT_COLLECTION_NAME)
    res = searcher.search("cardinality of should request")
    for hit in res:
        print(json.dumps(hit))
