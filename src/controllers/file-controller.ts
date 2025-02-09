import { Request, Response } from "express";
import { FolderModel, IFolder } from "../models/folder-model.js"; // Adjust import based on your project structure
import { FileModel, IFile } from "../models/file-model.js";
import { Types } from "mongoose";
import { AccountModel } from "../models/account-model.js";
import { getDrive } from "../configs/google-auth-config.js";

export const fileInfo = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const fileId = request.params.fileId;
    const userId = request.session.userId;
    const file = await FileModel.findById(fileId);

    if (!file || file.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to file" });
    }

    return response.status(200).json({ message: "success", file: file });

    // Your logic here
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const fileDelete = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const fileId = request.params.fileId;
    const userId = request.session.userId;
    const file = await FileModel.findById(fileId);

    if (!file || file.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to file" });
    }

    const chunks = file.chunks;
    const refreshtokenMap = new Map<Types.ObjectId, string>();

    for (const chunk of chunks) {
      let refresh_token = refreshtokenMap.get(chunk.accountId);

      if (!refresh_token) {
        const account = await AccountModel.findById(chunk.accountId);
        refreshtokenMap.set(chunk.accountId, account!.refreshToken!);
        refresh_token = account!.refreshToken!;
      }

      const drive = getDrive(refresh_token);

      const response = await drive.files.delete({ fileId: chunk.driveId });
    }

    return response.status(200).json({ message: "Folder Deleted", file: file });

    // Your logic to delete folder
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const fileUpdate = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const fileId = request.params.fileId;
    const userId = request.session.userId;
    const file = await FileModel.findById(fileId);

    if (!file || file.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to file" });
    }

    const name = request.body.name;
    file.name = name;
    await file.save();

    return response.status(200).json({ message: "Name of File Updated" });

    // Your logic to update folder
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};
