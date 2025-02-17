import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IAccount extends Document {
  _id: Types.ObjectId;
  email: string;
  picture: Base64URLString;
  userId: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  scope: string[];
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
    picture: {
      type: mongoose.SchemaTypes.String,
      required: true,
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
