"""
Copy the three collections used by this app from a source Qdrant instance
(typically your local Docker container) to a target Qdrant Cloud cluster.

Usage:
    export SRC_URL=http://localhost:6333
    export DST_URL=https://your-cluster.aws.cloud.qdrant.io:6333
    export DST_API_KEY=...
    python -m tools.migrate_to_qdrant_cloud
"""

import os
import sys

from qdrant_client import QdrantClient

COLLECTIONS = [
    "code-files",
    "code-signatures",
    "code-snippets-unixcoder",
]

BATCH = 128


def main() -> int:
    src_url = os.environ.get("SRC_URL", "http://localhost:6333")
    dst_url = os.environ.get("DST_URL")
    dst_api_key = os.environ.get("DST_API_KEY")
    if not dst_url or not dst_api_key:
        print("DST_URL and DST_API_KEY must be set", file=sys.stderr)
        return 1

    src = QdrantClient(url=src_url)
    dst = QdrantClient(url=dst_url, api_key=dst_api_key)

    for name in COLLECTIONS:
        if not src.collection_exists(name):
            print(f"skip {name}: not in source")
            continue

        info = src.get_collection(name)
        print(f"migrating {name} ({info.points_count} points)")

        if dst.collection_exists(name):
            dst.delete_collection(name)
        dst.create_collection(
            collection_name=name,
            vectors_config=info.config.params.vectors,
        )

        offset = None
        migrated = 0
        while True:
            points, next_offset = src.scroll(
                collection_name=name,
                limit=BATCH,
                with_payload=True,
                with_vectors=True,
                offset=offset,
            )
            if not points:
                break
            dst.upsert(collection_name=name, points=points)
            migrated += len(points)
            print(f"  {migrated}/{info.points_count}")
            if next_offset is None:
                break
            offset = next_offset

        print(f"done {name}: {migrated} points")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
