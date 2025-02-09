import { Request, Response } from "express";
import { UserModel } from "../models/user-model.js";

export const UserInfo = async (request: Request, response: Response): Promise<any> => {
  try {
    const userId = request.session.userId;
    const user = await UserModel.findById(userId);
    return response.status(200).json({ message: "Success", user: user });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};
