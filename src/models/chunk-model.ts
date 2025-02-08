import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChunk {
  index: number;
  driveId: string;
  accountId: Types.ObjectId;
}

export const ChunkSchema = new Schema<IChunk>(
  {
    index: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
    driveId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    accountId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Account",
    },
  },
  { _id: false },
);
