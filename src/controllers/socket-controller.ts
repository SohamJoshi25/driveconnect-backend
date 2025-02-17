import { Readable } from "stream";
import { FileModel, IFile } from "../models/file-model.js";
import { IChunkJWT, IFileChunkData, IFileDownload, IFileUploadStartData } from "../types/socket-interface.js";
import { createJWT, verifyJWT } from "../utils/jwt-util.js";
import { getRefreshTokens } from "../utils/account-util.js";
import { getDrive } from "../configs/google-auth-config.js";
import { AccountModel } from "../models/account-model.js";
import { FolderModel } from "../models/folder-model.js";
import { UserModel } from "../models/user-model.js";
import { ChunkSchema, IChunk } from "../models/chunk-model.js";
import mongoose, { Types } from "mongoose";
import { Socket, DefaultEventsMap } from "socket.io";
import { getDriveFiles } from "../utils/drive-util.js";

const CHUNK_SIZE_50 = 1024*1024*50;
const CHUNK_SIZE_10 = 1024*1024*10;
const CHUNK_SIZE_1 = 1024*1024;

export const OnFileChunk = async (data: IFileChunkData, callback: (response: { success: boolean; message?: string; error?: string }) => void) => {
  try {
    const { chunkBuffer, chunkIndex, token } = data;

    console.log(`Received chunk ${chunkIndex + 1}`);

    const { fileId, refresh_token_data }: IChunkJWT = verifyJWT(token);
    const file = await FileModel.findById(fileId);

    if (!file) {
      return callback({ success: false, error: "File not found associated to FileID" });
    }

    const fileMetadata = {
      name: `${file._id}.${chunkIndex}`,
      parents: ["appDataFolder"],
    };

    const bufferChunk = Buffer.from(chunkBuffer);
    const stream = new Readable();
    stream.push(bufferChunk);
    stream.push(null);

    const media = {
      mimeType: "application/octet-stream",
      body: stream,
    };

    // //Using linear strategy of MOD
    // const refresh_token = refreshTokens[chunkIndex % refreshTokens.length];

    let refreshToken;

    for (const rt of refresh_token_data) {
      if (rt.index <= chunkIndex) {
        refreshToken = rt;
      }
    }

    if (!refreshToken) {
      refreshToken = refresh_token_data[refresh_token_data.length - 1];
    }

    const drive = getDrive(refreshToken.refresh_token);

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    file.chunks.push({
      index: chunkIndex,
      driveId: response.data.id!,
      accountId: refreshToken.accountId,
    });

    await file.save();

    console.log(`Chunk ${chunkIndex} Uploaded`, response.data.id);

    callback({ success: true });
  } catch (error) {
    console.error("Error uploading file:", error);
    callback({ success: false });
  }
};

export const OnFileUploadStart = async (data: IFileUploadStartData, callback: (response: { success: boolean; token?: string; error?: string; chunk_size?: number, file?:IFile }) => void) => {
  try {
    console.log("Started");
    console.log(data);
    const userId = verifyJWT(data.token)._id;
    const user = await UserModel.findById(userId);
    const AccountRefreshToken = await getRefreshTokens(userId);
    const CHUNK_SIZE = (data.size>(CHUNK_SIZE_50*10) ? CHUNK_SIZE_50 : data.size>(CHUNK_SIZE_10*10) ? CHUNK_SIZE_10 : CHUNK_SIZE_1 );
    const totalChunkCount = Math.ceil(data.size / CHUNK_SIZE);
    const chunkCountPerAccount = Math.floor(totalChunkCount / AccountRefreshToken.length);
    const parentFolderId = data.parentFolderId ? new mongoose.Types.ObjectId(data.parentFolderId) : user!.rootFolderId!;
    const refresh_token_data: { refresh_token: string; index: number; accountId: Types.ObjectId }[] = new Array();
    console.log(AccountRefreshToken,parentFolderId);

    if(AccountRefreshToken.length==0){
      callback({success:false,error:"Please add a drive account first"});
      return;
  }


    AccountRefreshToken.forEach((account, idx) => {
      refresh_token_data.push({
        //FIXME: Should Validate all Drive has Space hence we have storageQuota in accountRefreshToken
        refresh_token: account.account.refreshToken,
        index: chunkCountPerAccount * (idx + 1),
        accountId: account.account._id,
      });
    });

    console.log(refresh_token_data);

    const file = new FileModel({ userId, name: data.name, extention: data.extention, size: data.size, chunkSize: CHUNK_SIZE, parentFolderId: parentFolderId });
    await file.save();

    // Push this file in parentFolder using ParentFolderID
    const parentFolder = await FolderModel.findById(parentFolderId);
    parentFolder?.subFiles.push(file._id);

    await parentFolder?.save();

    const token = createJWT({ refresh_token_data, fileId: file._id });
    console.log(token);

    callback({ success: true, token: token, chunk_size: CHUNK_SIZE, file:file });
  } catch (error) {
    console.log(error);
    callback({ success: false, error: JSON.stringify(error) });
  }
};

export const OnFileUploadEnd = async (callback: (response: { success: boolean }) => void) => {
  console.log("FILE UPLOAD COMPLETE");
};

export const OnFileDownload = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, data: IFileDownload, callback: (response: { success: boolean; message?: string; error?: string }) => void) => {
  try {
    console.log("Started Sending");
    const { token, fileId } = data;
    const userId: string = verifyJWT(token)._id;

    const file = await FileModel.findById(fileId);

    if (!file || !userId || file.userId.toString() !== userId) {
      console.log("Malformed Request", file, userId);
      return callback({ success: false, error: "Malformed Request" });
    }

    await new Promise<void>((resolve, reject) => {
      socket.emit("file_info_download", file, (ack: { success: boolean }) => {
        if (ack && ack.success) {
          console.log("Handshake Complete");
          resolve();
        } else {
          console.log("Handshake Error");
          reject(new Error("Handshake failed"));
        }
      });
    });

    const chunks = file.chunks;
    chunks.sort((a, b) => a.index - b.index);
    const refreshtokenMap = new Map<Types.ObjectId, string>();

    for (const chunk of chunks) {
      let refresh_token = refreshtokenMap.get(chunk.accountId);
      console.log(chunk);

      if (!refresh_token) {
        const account = await AccountModel.findById(chunk.accountId);
        refreshtokenMap.set(chunk.accountId, account!.refreshToken!);
        refresh_token = account!.refreshToken!;
      }

      const drive = getDrive(refresh_token);
      // const responseData = await drive.files.list({
      //   spaces: "appDataFolder",
      //   fields: "files(id, name, mimeType, size, createdTime, modifiedTime, parents, description)",
      // });
      // console.log(responseData.data.files);
      const response = await drive.files.get({ fileId: chunk.driveId, alt: "media" }, { responseType: "arraybuffer" });
      const fileBuffer = Buffer.from(response.data as ArrayBuffer);

      await emitChunk(socket, fileBuffer);
    }

    await new Promise<void>((resolve, reject) => {
      socket.emit("file_download_end");
    });

    return callback({ success: true });
  } catch (error) {
    console.log(error);
    callback({ success: false, error: JSON.stringify(error) });
  }
};

const emitChunk = (socket: Socket, fileBuffer: Buffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    socket.emit("file_chunk_download", { fileBuffer }, (ack: { success: boolean }) => {
      if (ack?.success) {
        resolve();
      } else {
        console.error("Error in file chunk transmission");
        reject(new Error("Failed to transmit file chunk"));
      }
    });
  });
};
