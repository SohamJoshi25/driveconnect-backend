import { Request, Response } from "express";
import { UserModel } from "../models/user-model.js";
import { AccountModel, IAccount } from "../models/account-model.js";
import { Types } from "mongoose";
import { deleteDriveFiles } from "../utils/drive-util.js";
import { FileModel } from "../models/file-model.js";
import { FolderModel } from "../models/folder-model.js";

export const UserInfo = async (request: Request, response: Response): Promise<any> => {
  try {
    const userId = request.session.userId;
    const user = await UserModel.findById(userId);
    return response.status(200).json({ message: "Success", user: user });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const flushUserData = async (request: Request, response: Response): Promise<any> => {
  try {
    const userId = request.session.userId;
    
    const accounts:IAccount[] = await AccountModel.find({userId:userId});


    for(const account of accounts){
      await deleteDriveFiles(account.refreshToken);
      console.log("Deleted Account ", account._id);
    }

    const files = await FileModel.deleteMany({userId:userId})
    await FolderModel.deleteMany({
      userId: userId,
      name: { $ne: "root" }
    });

    await FolderModel.updateOne(
      { userId: userId, name: "root" },
      { $set: { subFiles: [], subFolders: [] } }
    );

    return response.status(200).json({ message: "Success"});
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};