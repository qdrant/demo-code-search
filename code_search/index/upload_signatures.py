import json
from pathlib import Path

import tqdm
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from sentence_transformers import SentenceTransformer

from code_search.config import DATA_DIR, QDRANT_URL, QDRANT_API_KEY
from code_search.index.textifier import textify

file_name = Path(DATA_DIR) / "structures.json"

ENCODER_NAME = "all-MiniLM-L6-v2"
ENCODER_SIZE = 384


def iter_batch(iterable, batch_size=64):
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


def load_records():
    with open(file_name, "r") as fp:
        for line in fp:
            row = json.loads(line)
            yield row


def encode(sentence_transformer_name=ENCODER_NAME):
    model = SentenceTransformer(sentence_transformer_name)
    for batch in iter_batch(load_records()):
        texts = [textify(row) for row in batch]
        embeddings = model.encode(texts).tolist()
        yield from embeddings


def upload():
    collection_name = "code-signatures"

    client = QdrantClient(
        QDRANT_URL,
        api_key=QDRANT_API_KEY,
        prefer_grpc=True,
    )

    print(f"Recreating the collection {collection_name}")
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=ENCODER_SIZE,
            distance=Distance.COSINE,
        )
    )

    client.upload_collection(
        collection_name=collection_name,
        vectors=encode(),
        payload=tqdm.tqdm(load_records()),
    )


if __name__ == '__main__':
    upload()
