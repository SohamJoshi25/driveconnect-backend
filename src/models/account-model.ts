import { UUID } from "crypto";
import { url } from "inspector";
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAccount extends Document {
  _id: UUID;
  email: String;
  accessToken: String;
  refreshToken: String;
  scope: String;
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
    accessToken: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    refreshToken: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    scope: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    expiresAt: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const AccountModel: Model<IAccount> = mongoose.model("Account", AccountSchema);
