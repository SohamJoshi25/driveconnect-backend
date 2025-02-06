import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IAccount extends Document {
  _id: UUID;
  email: String;
  userId: Types.ObjectId;
  accessToken: String;
  refreshToken: String;
  scope: String[];
  expiresAt?: Number;
  createdAt?: string;
  updatedAt?: string;
}

export const AccountSchema = new Schema<IAccount>(
  {
    email: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    accessToken: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    refreshToken: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    scope: {
      type: [String],
      required: true,
      default: [],
    },
    expiresAt: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const AccountModel: Model<IAccount> = mongoose.model("Account", AccountSchema);
