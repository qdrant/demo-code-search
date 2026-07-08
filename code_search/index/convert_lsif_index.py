from pathlib import Path

import json
from urllib.parse import unquote, urlparse
from urllib.request import url2pathname

from code_search.config import DATA_DIR

LSIF_INDEX = Path(DATA_DIR) / "index.lsif"


def uri_to_path(uri: str) -> Path:
    """Convert a file:// URI to a local path, handling Windows drive letters."""
    return Path(url2pathname(unquote(urlparse(uri).path)))


if __name__ == '__main__':

    root_dir = None
    documents, folding_ranges, edges = dict(), dict(), []
    with open(LSIF_INDEX, "r", encoding="utf-8") as fp:
        for row in fp:
            row_dict = json.loads(row)
            vertex_id = row_dict["id"]
            if row_dict["type"] == "vertex" and row_dict["label"] == "metaData":
                root_dir = uri_to_path(row_dict["projectRoot"])

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

        doc_path = uri_to_path(document["uri"])
        doc_lines = doc_path.read_text(encoding="utf-8", errors="ignore").split("\n")
        rel_path = doc_path.relative_to(root_dir.absolute())

        for current_range in folding_range["result"]:
            if current_range.get("kind") == "imports":
                continue
            start_line, start_character = (
                current_range["startLine"],
                current_range["startCharacter"],
            )
            end_line, end_character = (
                current_range["endLine"],
                current_range["endCharacter"],
            )
            code_snippet = "\n".join(doc_lines[start_line : end_line + 1])

            entries.append(
                {
                    # POSIX-style so paths stay consistent across collections
                    # and usable in GitHub links, regardless of indexing OS.
                    "file": rel_path.as_posix(),
                    "start_line": start_line,
                    "start_character": start_character,
                    "end_line": end_line,
                    "end_character": end_character,
                    "code_snippet": code_snippet,
                }
            )

    with open(Path(DATA_DIR) / "qdrant_snippets.jsonl", "w", encoding="utf-8") as fp:
        for entry in entries:
            fp.write(json.dumps(entry) + "\n")
