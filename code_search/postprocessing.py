from collections import defaultdict
from typing import List


def merge_search_results(code_search_result: List[dict], nlu_search_result: List[dict]) -> List[dict]:
    """Merge search results from code and NLU searchers

    Args:
        code_search_result (List[dict]): Code search results
            Examples:
                [
                    {"end_line": 127, "file": "lib/segment/src/index/query_estimator.rs", "start_line": 123}
                    {"end_line": 830, "file": "lib/segment/src/segment.rs", "start_line": 827}
                    {"end_line": 169, "file": "lib/segment/src/index/field_index/field_index_base.rs", "start_line": 166}
                    {"end_line": 162, "file": "lib/segment/src/index/query_estimator.rs", "start_line": 158}
                    {"end_line": 152, "file": "lib/collection/src/shards/local_shard_operations.rs", "start_line": 150}
                ]
        nlu_search_result (List[dict]): NLU search results
            Examples:
                [
                    {
                        "code_type": "Function",
                        "context": {
                            "file_name": "query_estimator.rs",
                            "file_path": "lib/segment/src/index/query_estimator.rs",
                            "module": "index",
                            "snippet": "...",
                            "struct_name": null
                        },
                        "docstring": null,
                        "line": 13,
                        "line_from": 13,
                        "line_to": 39,
                        "name": "combine_should_estimations",
                        "signature": "fn combine_should_estimations () -> CardinalityEstimation"
                    }
                ]
    """

    code_search_result_by_file = defaultdict(list)
    for hit in code_search_result:
        code_search_result_by_file[hit["file"]].append(hit)

    for nlu_search_hit in nlu_search_result:
        file = nlu_search_hit["context"]["file_path"]
        if file in code_search_result_by_file:
            nlu_search_hit["sub_matches"] = try_merge_overlapping_snippets(
                code_search_result_by_file[file],
                nlu_search_hit
            )
            for sub_match in nlu_search_hit["sub_matches"]:
                nlu_search_hit["context"]["snippet"] = highlight_overlap(
                    text=nlu_search_hit["context"]["snippet"],
                    start_line=nlu_search_hit["line_from"],
                    from_line=sub_match["overlap_from"],
                    to_line=sub_match["overlap_to"]
                )
    nlu_search_result = sorted(nlu_search_result, key=lambda x: -len(x.get('sub_matches', [])))

    return nlu_search_result


def highlight_overlap(text: str, start_line: int, from_line: int, to_line: int, start_tag="<mark>", end_tag="</mark>"):
    """Highlight overlapping lines in the text using start_tag and end_tag

    Args:
        text:
        start_line:
        from_line:
        to_line:
        start_tag:
        end_tag:

    Returns: Highlighted text
    """
    lines = text.split("\n")
    highlighted_lines = []
    for i, line in enumerate(lines):
        if i + start_line in range(from_line, to_line + 1):
            highlighted_lines.append(f"{start_tag}{line}{end_tag}")
        else:
            highlighted_lines.append(line)
    return "\n".join(highlighted_lines)


def try_merge_overlapping_snippets(code_search_results: List[dict], nlu_search_result: dict) -> List[dict]:
    """Find code search results that overlap with NLU search results and merge them
    Use nlu_search_result as a base for merging

    Args:
        code_search_results:
            [
                    {"end_line": 127, "start_line": 123, ...}
                    {"end_line": 830, "start_line": 827, ...}
                    {"end_line": 169, "start_line": 166, ...}
                    {"end_line": 162, "start_line": 158, ...}
                    {"end_line": 14, "start_line": 16, ...}
            ]
        nlu_search_result:
            {
                "line": 13,
                "line_from": 13,
                "line_to": 39,
                ...
            }

    Returns: Overlapping code search results merged with NLU search results
    """
    overlapped = []
    code_search_result = sorted(code_search_results, key=lambda x: x["start_line"])
    for code_search_hit in code_search_result:
        from_a = code_search_hit["start_line"] + 1
        to_a = code_search_hit["end_line"] + 1
        from_b = nlu_search_result["line_from"]
        to_b = nlu_search_result["line_to"]

        # get overlapping range
        start = max(from_a, from_b)
        end = min(to_a, to_b)
        if start <= end:
            overlapped.append({
                "overlap_from": start,
                "overlap_to": end,
            })

    return overlapped
