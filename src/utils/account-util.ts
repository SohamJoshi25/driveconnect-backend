import { Console } from "console";
import { IAccount, AccountModel } from "../models/account-model.js";
import { UserModel } from "../models/user-model.js";
import { Types } from "mongoose";

export const getRefreshTokens = async (userId: Types.ObjectId): Promise<IAccount[]> => {
  try {
    const Accounts: IAccount[] = await AccountModel.find({ userId: userId });
    return Accounts;
  } catch (error) {
    console.log("Error occured in getRefreshTokens ", error);
    return [];
  }
};
