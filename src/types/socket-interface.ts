import { Types } from "mongoose";

export interface IFileUploadStartData {
  token: string;
  name: string;
  extention: string;
  size: number;
  parentFolderId?: string;
}

export interface IFileChunkData {
  token: string;
  chunkBuffer: ArrayBuffer;
  chunkIndex: number;
}

export interface IChunkJWT {
  refresh_token_data: {
    refresh_token: string;
    index: number;
    accountId: Types.ObjectId;
  }[];
  fileId: Types.ObjectId;
}

export interface IFileDownload {
  token: string;
  fileId: Types.ObjectId;
}
