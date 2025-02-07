import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { ChunkSchema, IChunk } from "./chunk-model.js";

export interface IFile extends Document {
  _id: UUID;
  userId: Types.ObjectId;
  parentFolderId: Types.ObjectId;
  name: String;
  extention: String;
  size: Number;
  chunks: IChunk[];
  chunkSize: Number;
  downloadedAt?: String;
  createdAt?: String;
  updatedAt?: String;
}

export const FileSchema = new Schema<IFile>(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    parentFolderId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Folder",
    },
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    extention: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    size: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
    chunks: {
      type: [ChunkSchema],
      required: true,
      default: [],
    },
    chunkSize: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
    downloadedAt: {
      type: mongoose.SchemaTypes.Date,
      required: true,
      default: () => {
        return new Date();
      },
    },
  },
  { timestamps: true },
);

export const FileModel: Model<IFile> = mongoose.model("File", FileSchema);
