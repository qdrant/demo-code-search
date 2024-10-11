from pathlib import Path
from tqdm import tqdm
from qdrant_client.http import models as rest

import qdrant_client
import numpy as np
import json

from code_search.config import QDRANT_URL, QDRANT_API_KEY, DATA_DIR, QDRANT_CODE_COLLECTION_NAME
from code_search.model.encoder import UniXcoderEmbeddingsProvider

code_keys = [
    "code_snippet",
    "body",
    "signature",
    "name",
]


def encode_and_upload():
    client = qdrant_client.QdrantClient(
        QDRANT_URL,
        api_key=QDRANT_API_KEY,
        prefer_grpc=True,
    )

    collection_name = QDRANT_CODE_COLLECTION_NAME
    input_file = Path(DATA_DIR) / "qdrant_snippets.jsonl"
    encoder = UniXcoderEmbeddingsProvider()

    input_file = Path(DATA_DIR) / input_file
    output_file = Path(DATA_DIR) / f"{collection_name}.npy"

    if not input_file.exists():
        raise RuntimeError(f"File {input_file} does not exist. Skipping")

    if output_file.exists():
        print(f"File {output_file} already exists. Skipping encoding.")
        embeddings = np.load(str(output_file)).tolist()
    else:
        print(f"Preparing the output for {output_file}")

        embeddings = []
        with open(input_file, "r") as fp:
            for line in tqdm(fp):
                line_dict = json.loads(line)

                body = None
                for code_key in code_keys:
                    body = line_dict.get(code_key)
                    if body is not None:
                        break
                docstring = line_dict.get("docstring")

                if body is None or len(body) == 0:
                    continue

                embedding = encoder.embed_code(body, docstring)
                embeddings.append(embedding)

        np.save(str(output_file), np.array(embeddings))

    payloads = []
    with open(input_file, "r") as fp:
        for line in tqdm(fp):
            line_dict = json.loads(line)
            payloads.append(line_dict)

    print(f"Embeddings shape: ({len(embeddings)}, {len(embeddings[0])})")

    print(f"Recreating the collection {collection_name}")
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=rest.VectorParams(
            size=len(embeddings[1]),
            distance=rest.Distance.COSINE,
            on_disk=True,
        ),
        quantization_config=rest.ScalarQuantization(
            scalar=rest.ScalarQuantizationConfig(
                type=rest.ScalarType.INT8,
                always_ram=True,
                quantile=0.99,
            )
        )
    )

    print(f"Storing data in the collection {collection_name}")
    client.upload_collection(
        collection_name=collection_name,
        ids=[i for i, _ in enumerate(embeddings)],
        vectors=embeddings,
        payload=payloads,
    )


if __name__ == '__main__':
    encode_and_upload()
