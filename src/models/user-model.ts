import { UUID } from "crypto";
import { url } from "inspector";
import mongoose, { Document, Schema, Model } from "mongoose";
import { Url } from "url";

// "data": {
//     "id": "111658499613038364324",
//     "email": "sohamjoshichinchwad@gmail.com",
//     "verified_email": true,
//     "name": "Soham Joshi",
//     "given_name": "Soham",
//     "family_name": "Joshi",
//     "picture": "https://lh3.googleusercontent.com/a/ACg8ocLe62_9jTpfXS28XONJkQE-Z4VGMI3gp7EVbfyPWwOWZfrnris98g=s96-c"
//   }

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
      unique: true,
    },
    picture: {
      type: mongoose.SchemaTypes.String,
    },
  },
  { timestamps: true },
);
export const UserModel: Model<IUser> = mongoose.model("User", UserSchema);
