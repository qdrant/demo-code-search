import { Axios } from "./axios";
import { FILE_URL } from "./constants";

export type PathRequest = {
  path: string;
};

export const getFileResult = (PathRequest: PathRequest) => {
  const params = {
    path: PathRequest.path,
  };
  return Axios().get(FILE_URL, { params });
};
