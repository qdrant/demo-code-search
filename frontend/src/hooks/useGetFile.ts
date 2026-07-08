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

        if (res.status === 200) {
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
