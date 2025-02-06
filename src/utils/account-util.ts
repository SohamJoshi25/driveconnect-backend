import { IAccount, AccountModel } from "../models/account-model.js";
import { Types } from "mongoose";

export const getRefreshTokens = async (userId: Types.ObjectId): Promise<IAccount[]> => {
  const Accounts: IAccount[] = await AccountModel.find({ userId: userId });
  return Accounts;
};
