import { api } from "./axios";
import { FILE_URL } from "./constants";

export type FileResponse = {
  result: {
    code: string[];
    endline: number;
    startline: number;
    path: string;
  }[];
};

export const getFileResult = (path: string) =>
  api.get<FileResponse>(FILE_URL, { params: { path } });
