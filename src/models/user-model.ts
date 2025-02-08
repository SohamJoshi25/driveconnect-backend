import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, Types } from "mongoose";

import { AccountSchema, IAccount } from "./account-model.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  name: string;
  email: string;
  rootFolderId?: Types.ObjectId;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const UserSchema = new Schema<IUser>(
  {
    googleId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    email: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    rootFolderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Folder",
    },
    picture: {
      type: mongoose.SchemaTypes.String,
    },
  },
  { timestamps: true },
);
export const UserModel: Model<IUser> = mongoose.model("User", UserSchema);
