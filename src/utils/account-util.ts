import { response } from "express";
import { getDrive } from "../configs/google-auth-config.js";
import { IAccount, AccountModel, AccountSchema } from "../models/account-model.js";
import { Types } from "mongoose";
import { drive_v3 } from "googleapis";

type storageQuota =
  | {
      limit?: string | undefined;
      usage?: string | undefined;
      usageInDrive?: string | undefined;
      usageInDriveTrash?: string | undefined;
    }
  | null
  | undefined;

type IAccountRefreshToken = {
  account: IAccount;
  storageQuota: storageQuota;
};

export const getRefreshTokens = async (userId: Types.ObjectId): Promise<IAccountRefreshToken[]> => {
  const Accounts: IAccount[] = await AccountModel.find({ userId: userId });
  let AccountRefreshToken: IAccountRefreshToken[] = new Array();
  await Promise.all(
    Accounts.map(async (account) => {
      const drive = getDrive(account.refreshToken);
      const response = await drive.about.get({
        fields: "storageQuota",
      });
      AccountRefreshToken.push({
        account: account,
        storageQuota: response.data.storageQuota,
      });
    }),
  );
  return AccountRefreshToken;
};
