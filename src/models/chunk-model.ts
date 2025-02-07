import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChunk extends Document {
  index: Number;
  driveId: String;
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
