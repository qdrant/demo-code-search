import { api } from "./axios";
import { SEARCH_URL } from "./constants";

export type SearchResponse = {
  /**
   * Present when the backend fell back to keyword ranking because the
   * unixcoder collection is still building. Missing means semantic.
   */
  mode?: "keyword" | "semantic";
  /**
   * Server-side time to encode the query and search Qdrant, in milliseconds.
   * Excludes network, so it reflects this service rather than the viewer's
   * connection. Optional, since an older backend will not send it.
   */
  latency_ms?: number;
  /**
   * Commit of qdrant/qdrant the index was built from. Result links carry line
   * numbers, so they have to resolve against this rather than a moving branch.
   * Optional: an older backend will not send it, and links fall back to master.
   */
  indexed_commit?: string;
  result: {
    code_type: string;
    context: {
      file_name: string;
      file_path: string;
      module: string;
      snippet: string;
      /** Null for free functions, which are not attached to a struct. */
      struct_name: string | null;
    };
    docstring: string | null;
    line: number;
    line_from: number;
    line_to: number;
    name: string;
    signature: string;
    /**
     * Line ranges where the two models agreed, used to highlight inside the
     * snippet. Only present when a result's file also came back from the code
     * search, which is a minority of them - so this is genuinely optional and
     * was previously typed as though it always arrived.
     */
    sub_matches?: {
      overlap_from: number;
      overlap_to: number;
    }[];
  }[];
};

export const getSearchResult = (query: string) =>
  api.get<SearchResponse>(SEARCH_URL, { params: { query } });
