import { useCallback } from "react";
import { getSearchResult, SearchResponse } from "@/api/search";
import useMountedState from "./useMountedState";

export type { SearchResponse };

export const useGetSearchResult = () => {
  const [data, setData] = useMountedState<SearchResponse | null>(null);
  const [error, setError] = useMountedState<string | null>(null);
  const [loading, setLoading] = useMountedState<boolean>(false);

  const getSearch = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSearchResult(query);

        // A 200 alone isn't proof we got search results. When the API base URL
        // is misconfigured the request never leaves the static host, which
        // answers with the app's own index.html and a 200. That HTML used to
        // sail through as data and blow up later in rendering, so check the
        // payload actually looks like a search response.
        if (res.status === 200 && Array.isArray(res.data?.result)) {
          setData(res.data);
        } else {
          setError("Failed to get search results");
        }
      } catch {
        setError("Failed to get search results");
      } finally {
        setLoading(false);
      }
    },
    [setData, setError, setLoading]
  );

  const resetData = useCallback(() => {
    setData(null);
    setError(null);
  }, [setData, setError]);

  return { data, error, loading, getSearch, resetData };
};
