import { api } from "./axios";
import { SEARCH_URL } from "./constants";

export type SearchResponse = {
  /**
   * Present when the backend fell back to keyword ranking because the
   * unixcoder collection is still building. Missing means semantic.
   */
  mode?: "keyword" | "semantic";
  result: {
    code_type: string;
    context: {
      file_name: string;
      file_path: string;
      module: string;
      snippet: string;
      struct_name: string;
    };
    docstring: string | null;
    line: number;
    line_from: number;
    line_to: number;
    name: string;
    signature: string;
    sub_matches: {
      overlap_from: number;
      overlap_to: number;
    }[];
  }[];
};

export const getSearchResult = (query: string) =>
  api.get<SearchResponse>(SEARCH_URL, { params: { query } });
