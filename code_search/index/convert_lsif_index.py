import os.path
from pathlib import Path

import json
from urllib.parse import urlparse

from code_search.config import DATA_DIR

LSIF_INDEX = Path(DATA_DIR) / "index.lsif"


if __name__ == '__main__':

    root_dir = None
    documents, folding_ranges, edges = dict(), dict(), []
    with open(LSIF_INDEX, "r") as fp:
        for row in fp:
            row_dict = json.loads(row)
            vertex_id = row_dict["id"]
            if row_dict["type"] == "vertex" and row_dict["label"] == "metaData":
                root_dir = Path(os.path.normpath(row_dict["projectRoot"].replace("file://", "")))

            if row_dict["type"] == "vertex" and row_dict["label"] == "document":
                documents[vertex_id] = row_dict
            if row_dict["type"] == "vertex" and row_dict["label"] == "foldingRangeResult":
                folding_ranges[vertex_id] = row_dict
            if (
                row_dict["type"] == "edge"
                and row_dict["label"] == "textDocument/foldingRange"
            ):
                folding_range_id = row_dict["inV"]
                document_id = row_dict["outV"]
                edges.append((document_id, folding_range_id))

    entries = []
    for document_id, folding_range_id in edges:
        document = documents[document_id]
        folding_range = folding_ranges[folding_range_id]
        for current_range in folding_range["result"]:
            if current_range.get("kind") == "imports":
                continue
            doc_lines = Path(urlparse(document["uri"]).path).read_text().split("\n")
            start_line, start_character = (
                current_range["startLine"],
                current_range["startCharacter"],
            )
            end_line, end_character = (
                current_range["endLine"],
                current_range["endCharacter"],
            )
            code_snippet = "\n".join(doc_lines[start_line : end_line + 1])

            abs_path = Path(document["uri"].replace("file://", ""))
            # make `abs_path` relative to `root_dir`
            rel_path = abs_path.relative_to(Path(root_dir).absolute())

            entries.append(
                {
                    "file": str(rel_path),
                    "start_line": start_line,
                    "start_character": start_character,
                    "end_line": end_line,
                    "end_character": end_character,
                    "code_snippet": code_snippet,
                }
            )

    with open(Path(DATA_DIR) / "qdrant_snippets.jsonl", "w") as fp:
        for entry in entries:
            fp.write(json.dumps(entry) + "\n")

