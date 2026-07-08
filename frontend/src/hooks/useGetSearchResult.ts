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

        if (res.status === 200) {
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
