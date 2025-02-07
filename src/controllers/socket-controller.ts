import { Readable } from "stream";
import { FileModel } from "../models/file-model.js";
import { IFileChunkData, IFileUploadStartData } from "../types/socket-interface.js";
import { createJWT, verifyJWT } from "../utils/jwt-util.js";
import { getRefreshTokens } from "../utils/account-util.js";
import { getDrive } from "../configs/google-auth-config.js";
import { AccountModel } from "../models/account-model.js";

const CHUNK_SIZE = 10 * 1024 * 1024;

export const OnFileChunk = async (data: IFileChunkData, callback: (response: { success: boolean }) => void) => {
  const { chunkBuffer, chunkIndex, fileId, token } = data;

  console.log(`Received chunk ${chunkIndex + 1}`);

  const file = await FileModel.findById(fileId);

  if (!file) {
    //TODO:
  }

  if (file?.chunks.length !== chunkIndex) {
    //TODO:+
  }

  const fileMetadata = {
    name: `${file?.name}.${chunkIndex}`,
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

  const decoded = verifyJWT(token);
  const refreshTokens = await getRefreshTokens(decoded._id);

  //Using linear strategy of MOD
  const refresh_token = refreshTokens[chunkIndex % refreshTokens.length];
  const drive = getDrive(refresh_token.account.refreshToken);

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    // file?.chunks.push({ index: chunkIndex, driveId: response.data.id!, accountId: refresh_token._id });

    // filesID.push(response.data.id);
    // console.log(`Chunk ${currentChunk} Uploaded File ID:`, response.data.id);

    callback({ success: true });
  } catch (error) {
    console.error("Error uploading file:", error);
    callback({ success: false });
  }
};

export const OnFileUploadStart = async (data: IFileUploadStartData, callback: (response: { success: boolean; token?: string; error?: string }) => void) => {
  try {
    console.log("Started");
    console.log(data);
    const userId = verifyJWT(data.token)._id;
    const AccountRefreshToken = await getRefreshTokens(userId);
    const totalChunkCount = Math.ceil(data.size / CHUNK_SIZE);
    const chunkCountPerAccount = Math.floor(totalChunkCount / AccountRefreshToken.length);

    const refresh_token_data: { refresh_token: string; index: number }[] = new Array();

    AccountRefreshToken.forEach((account, idx) => {
      refresh_token_data.push({
        //FIXME: Should Validate all Drive has Space hence we have storageQuota in accountRefreshToken
        refresh_token: account.account.refreshToken,
        index: chunkCountPerAccount * (idx + 1),
      });
    });

    const file = new FileModel({ userId, name: data.name, extention: data.extention, size: data.size, chunkSize: CHUNK_SIZE });
    await file.save();

    //TODO: Push this file in parentFolder using ParentFolderID
    const parentFolderId = data.parentFolderId;

    const token = createJWT({ refresh_token_data, file });
    console.log(token);

    callback({ success: true, token: token });
  } catch (error) {
    console.log(error);
    callback({ success: false, error: JSON.stringify(error) });
  }
};

export const OnFileUploadEnd = async (callback: (response: { success: boolean }) => void) => {};
