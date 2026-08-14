import json
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

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
        # The vector depends only on the query text, and encoding is where
        # essentially all of a search's time goes. The demo ships example
        # queries that get clicked far more than anything else, so caching makes
        # the common path free. Bounded, so it cannot grow without limit.
        self._embed = lru_cache(maxsize=512)(self._embed_query)

    def _embed_query(self, query: str) -> tuple:
        return tuple(self.encoder.embed_code(docstring=query))

    def search(self, query, limit=5) -> list[dict]:
        vector = list(self._embed(query))
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
        self._embed = lru_cache(maxsize=512)(self._embed_query)

    def _embed_query(self, query: str) -> tuple:
        return tuple(self.encoder.encode([query])[0].tolist())

    def search(self, query, limit=5) -> list[dict]:
        vector = list(self._embed(query))
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
        # The two searches ran one after the other, so a query paid for both
        # forward passes in series. They share nothing: separate models,
        # separate Qdrant clients. Torch releases the GIL during inference, so
        # given more than one core these genuinely overlap, and on a single core
        # it costs no more than the pool itself.
        self._pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="search")

    def search(self, query, limit=5, code_limit=20) -> list[dict]:
        nlu_future = self._pool.submit(self.nlu_searcher.search, query, limit)
        code_future = self._pool.submit(self.code_searcher.search, query, code_limit)

        return merge_search_results(code_future.result(), nlu_future.result())


if __name__ == '__main__':
    searcher = CombinedSearcher()

    res = searcher.search("cardinality of should request")
    for hit in res:
        print(json.dumps(hit))
