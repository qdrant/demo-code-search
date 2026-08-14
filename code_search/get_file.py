from qdrant_client.http import models

from code_search.config import QDRANT_FILE_COLLECTION_NAME, make_qdrant_client


class FileGet:

    def __init__(self):
        self.collection_name = QDRANT_FILE_COLLECTION_NAME
        self.client = make_qdrant_client()

    def get(self, path, limit=5) -> list[dict]:
        points, _next_offset = self.client.scroll(
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

        return [point.payload for point in points]


if __name__ == '__main__':
    searcher = FileGet()

    res = searcher.get("lib/collection/src/collection_manager/optimizers/indexing_optimizer.rs")
    for hit in res:
        print(hit)
