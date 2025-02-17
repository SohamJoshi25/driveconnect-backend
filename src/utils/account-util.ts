import axios from "axios";
import { getDrive } from "../configs/google-auth-config.js";
import { IAccount, AccountModel, AccountSchema } from "../models/account-model.js";
import { Types } from "mongoose";

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
  if (Accounts.length === 0) return [];
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


export const base64Image = async (url:string) : Promise<string> => {
  const response = await axios.get(url, {
      responseType: 'arraybuffer'
  });

  const base64Image = Buffer.from(response.data).toString('base64');

  const mimeType = response.headers['content-type'] || 'image/png';

  return `data:${mimeType};base64,${base64Image}`
};