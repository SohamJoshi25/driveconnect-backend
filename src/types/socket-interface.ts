import { Types } from "mongoose";

export interface IFileUploadStartData {
  token: string;
  name: string;
  extention: string;
  size: number;
  parentFolderId: Types.ObjectId;
}

export interface IFileChunkData {
  token: string;
  chunkBuffer: ArrayBuffer;
  chunkIndex: number;
  fileId: string;
}

export interface IChunkJWT {}
