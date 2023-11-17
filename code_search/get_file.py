from typing import List

from qdrant_client import QdrantClient
from qdrant_client.http import models

from code_search.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_FILE_COLLECTION_NAME

class FileGet:

    def __init__(self):
        self.collection_name = QDRANT_FILE_COLLECTION_NAME
        self.client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    def get(self, path, limit=5) -> List[dict]:
        result = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="path",
                        match=models.MatchValue(value=path),
                    )
                ]
            ),
            limit=limit,
        )

        return [hit.payload for hit in result[0]]


if __name__ == '__main__':
    path = "lib/collection/src/collection_manager/optimizers/indexing_optimizer.rs"

    searcher = FileGet()

    res = searcher.get(path)
    for hit in res:
        print(hit)
