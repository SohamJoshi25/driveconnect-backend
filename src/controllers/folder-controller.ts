import { Request, Response } from "express";
import { FolderModel, IFolder } from "../models/folder-model.js"; // Adjust import based on your project structure
import { FileModel, IFile } from "../models/file-model.js";
import mongoose from "mongoose";

export const folderInfo = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const folderId = request.params.folderId;
    const userId = request.session.userId;
    const folder = await FolderModel.findById(folderId);

    if (!folder || folder.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to folder" });
    }

    return response.status(200).json({ message: "success", folder: folder });

    // Your logic here
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const folderNestedInfo = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const folderId = request.params.folderId;
    const userId = request.session.userId;
    const folder = await FolderModel.findById(folderId);

    if (!folder || folder.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to folder" });
    }

    const subFiles: Partial<IFile>[] = [];
    const subFolders: IFolder[] = [];

    for (const subFolderId of folder.subFolders) {
      const subFolder = await FolderModel.findById(subFolderId);
      if (subFolder) {
        subFolders.push(subFolder);
      }
    }

    for (const subFileId of folder.subFiles) {
      const subFile = await FileModel.findById(subFileId);
      if (subFile) {
        const _file: Partial<IFile> = {
          _id: subFile._id,
          userId: subFile.userId,
          parentFolderId: subFile.parentFolderId,
          name: subFile.name,
          extention: subFile.extention,
          size: subFile.size,
          chunkSize: subFile.chunkSize,
          downloadedAt: subFile.downloadedAt,
          createdAt: subFile.createdAt,
          updatedAt: subFile.updatedAt,
        };
        subFiles.push(_file);
      }
    }

    const folder_data: any = {};

    folder_data._id = folder._id;
    folder_data.userId = folder.userId;
    folder_data.parentFolderId = folder.parentFolderId;
    folder_data.name = folder.name;
    folder_data.size = folder.size;
    folder_data.path = folder.path;
    folder_data.createdAt = folder.createdAt;
    folder_data.updatedAt = folder.updatedAt;
    folder_data.subFiles = subFiles;
    folder_data.subFolders = subFolders;

    return response.status(200).json({
      message: "success",
      folder: folder_data,
    });

    // Your logic here
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const folderCreate = async (request: Request, response: Response): Promise<any> => {
  try {
    const parentFolderId = request.params.parentFolderId;
    if (!parentFolderId) {
      return response.status(400).json({ message: "A Parent Folder is required" });
    }
    const userId = request.session.userId;
    const folder = await FolderModel.findById(parentFolderId);

    if (!folder || folder.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to folder" });
    }

    const name = request.body.name;
    const path = folder.path;

    const newFolderData = {
      userId: userId,
      parentFolderId: parentFolderId,
      name: name,
      size: 0,
      path: path,
    };

    const newfolder = new FolderModel(newFolderData);
    newfolder.path.push(newfolder._id.toString());
    await newfolder.save();

    folder.subFolders.push(newfolder._id);
    await folder.save();

    return response.status(200).json({
      message: "success",
      folder: newfolder,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const folderDelete = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const folderId = request.params.folderId;
    const userId = request.session.userId;
    const folder = await FolderModel.findById(folderId);

    if (!folder || folder.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to folder" });
    }

    if (folder.subFiles.length !== 0 || folder.subFolders.length !== 0) {
      return response.status(400).json({ message: "Cannot Delete Folder because its contents are not empty" });
    } else {

      await FolderModel.findByIdAndUpdate(
        folder.parentFolderId,
        { $pull: { subFolders: new mongoose.Types.ObjectId(folder._id) } },
        { new: true }
      );

      await FolderModel.findByIdAndDelete(folderId);
      

      return response.status(200).json({ message: "Folder Deleted", folder: folder });
    }

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const folderUpdate = async (request: Request, response: Response): Promise<any> => {
  try {
    // Membership Check
    const folderId = request.params.folderId;
    const userId = request.session.userId;
    const folder = await FolderModel.findById(folderId);

    if (!folder || folder.userId.toString() !== userId) {
      return response.status(401).json({ message: "Unauthorized Access to folder" });
    }

    if (folder.name === "root") {
      return response.status(401).json({ message: "Cannot update root folder" });
    }

    const name = request.body.name;
    folder.name = name;
    await folder.save();

    return response.status(200).json({ message: "Name of Folder Updated" });

    // Your logic to update folder
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};
