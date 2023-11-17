import { StatusCodes } from "http-status-codes";
import useMountedState from "./useMountedState";
import { getFileResult } from "@/api/file";

export type searchResponse = {
  result: {
    code: string[];
    endline: number;
    startline: number;
    path: string;
  }[];
};
export const useGetFile = () => {
  const [data, setData] = useMountedState<searchResponse | null>(null);
  const [error, setError] = useMountedState<string | null>(null);
  const [loading, setLoading] = useMountedState<boolean>(false);

  const getFile = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFileResult({ path });

      switch (res.status) {
        case StatusCodes.OK: {
          const searchRes = res.data;
          setData(searchRes);
          break;
        }
        default: {
          setError("Failed to get the file");
        }
      }
    } catch {
      setError("Failed to get the file");
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setData(null);
  };

  return { data, error, loading, getFile, resetData };
};
