import { Request, Response } from "express";
import { FolderModel, IFolder } from "../models/folder-model.js"; // Adjust import based on your project structure
import { FileModel, IFile } from "../models/file-model.js";

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

    const subFiles: IFile[] = [];
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
        subFiles.push(subFile);
      }
    }

    const folder_data: any = folder;

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
      await FolderModel.findByIdAndDelete(folderId);
    }

    return response.status(200).json({ message: "Folder Deleted", folder: folder });

    // Your logic to delete folder
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
