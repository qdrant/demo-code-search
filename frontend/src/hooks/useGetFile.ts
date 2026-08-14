import { useCallback } from "react";
import { getFileResult, FileResponse } from "@/api/file";
import useMountedState from "./useMountedState";

export type { FileResponse };

export const useGetFile = () => {
  const [data, setData] = useMountedState<FileResponse | null>(null);
  const [error, setError] = useMountedState<string | null>(null);
  const [loading, setLoading] = useMountedState<boolean>(false);

  const getFile = useCallback(
    async (path: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getFileResult(path);

        // Same check as the search hook: a misconfigured API base URL means the
        // request never leaves the static host, which answers with the app's own
        // index.html under a 200. Without this the HTML gets stored as file data
        // and fails later, far from the cause.
        if (res.status === 200 && Array.isArray(res.data?.result)) {
          setData(res.data);
        } else {
          setError("Failed to load the file");
        }
      } catch {
        setError("Failed to load the file");
      } finally {
        setLoading(false);
      }
    },
    [setData, setError, setLoading]
  );

  const resetData = useCallback(() => {
    setData(null);
  }, [setData]);

  return { data, error, loading, getFile, resetData };
};
