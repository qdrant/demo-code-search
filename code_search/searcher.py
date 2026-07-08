import json

from sentence_transformers import SentenceTransformer

from code_search.config import ENCODER_NAME, QDRANT_CODE_COLLECTION_NAME, \
    QDRANT_NLU_COLLECTION_NAME, make_qdrant_client
from code_search.model.encoder import UniXcoderEmbeddingsProvider
from code_search.postprocessing import merge_search_results


class CodeSearcher:

    def __init__(self):
        self.collection_name = QDRANT_CODE_COLLECTION_NAME
        self.client = make_qdrant_client()
        self.encoder = UniXcoderEmbeddingsProvider("cpu")

    def search(self, query, limit=5) -> list[dict]:
        vector = self.encoder.embed_code(docstring=query)
        result = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=limit,
            with_payload=["start_line", "end_line", "file"],
        )

        return [hit.payload for hit in result.points]


class NluSearcher:

    def __init__(self):
        self.collection_name = QDRANT_NLU_COLLECTION_NAME
        self.client = make_qdrant_client()
        self.encoder = SentenceTransformer(ENCODER_NAME)

    def search(self, query, limit=5) -> list[dict]:
        vector = self.encoder.encode([query])[0].tolist()
        result = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=limit,
        )

        return [hit.payload for hit in result.points]


class CombinedSearcher:

    def __init__(self):
        self.nlu_searcher = NluSearcher()
        self.code_searcher = CodeSearcher()

    def search(self, query, limit=5, code_limit=20) -> list[dict]:
        nlu_res = self.nlu_searcher.search(query, limit=limit)
        code_res = self.code_searcher.search(query, limit=code_limit)

        return merge_search_results(code_res, nlu_res)


if __name__ == '__main__':
    searcher = CombinedSearcher()

    res = searcher.search("cardinality of should request")
    for hit in res:
        print(json.dumps(hit))
