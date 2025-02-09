import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { IFile, FileSchema } from "./file-model.js";

export interface IFolder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  parentFolderId: Types.ObjectId | null;
  name: string;
  size: number;
  subFolders: Types.ObjectId[];
  subFiles: Types.ObjectId[];
  path: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const FolderSchema = new Schema<IFolder>(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    parentFolderId: {
      type: mongoose.SchemaTypes.Mixed,
      required: true,
      ref: "Folder",
    },
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    size: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
    subFolders: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Folder",
        },
      ],
      default: [],
      required: true,
    },
    subFiles: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "File",
        },
      ],
      default: [],
      required: true,
    },
    path: {
      type: [String],
      required: true,
      default: ["."],
    },
  },
  { timestamps: true },
);

export const FolderModel: Model<IFolder> = mongoose.model("Folder", FolderSchema);
