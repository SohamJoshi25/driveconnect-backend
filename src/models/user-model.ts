import { UUID } from "crypto";
import mongoose, { Document, Schema, Model, ObjectId, Types } from "mongoose";

import { AccountSchema, IAccount } from "./account-model.js";

export interface IUser extends Document {
  _id: UUID;
  googleId: string;
  name: string;
  email: string;
  rootFolder?: string;
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
    rootFolder: {
      type: mongoose.SchemaTypes.String,
      default: "not-assigned",
    },
    picture: {
      type: mongoose.SchemaTypes.String,
    },
  },
  { timestamps: true },
);
export const UserModel: Model<IUser> = mongoose.model("User", UserSchema);
