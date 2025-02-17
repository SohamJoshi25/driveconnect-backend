import { Request, Response } from "express";
import { google } from "googleapis";
//configs
import { accountAuthUrl, userAuthUrl } from "../configs/google-auth-config.js";
import { APP_DOMAIN, GOOGLE_REDIRECT_URL } from "../configs/constants-config.js";

//models
import { UserModel } from "../models/user-model.js";
import { AccountModel } from "../models/account-model.js";
import { FolderModel } from "../models/folder-model.js";

//Utils
import { createJWT, verifyJWT } from "../utils/jwt-util.js";

//Packages
import url from "url";
import { Buffer } from "buffer";
import { base64Image } from "../utils/account-util.js";


export const userLogin = async (request: Request, response: Response): Promise<any> => {
  try {
    request.session.operation = "userLogin";
    return response.status(302).redirect(userAuthUrl);
  } catch (error) {
    return response.status(500).json({ message: "Error" });
  }
};

export const accountLogin = async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.query.token) {
      return response.status(401).json({ message: "Token Missing" });
    }

    const decoded = verifyJWT(request.query.token as string);

    request.session.userId = decoded._id;
    request.session.operation = "accountLogin";
    return response.status(302).redirect(accountAuthUrl);
  } catch (error) {
    return response.status(500).json({ message: "Error" });
  }
};

export const userCallback = async (request: Request, response: Response): Promise<any> => {
  try {
    let q = url.parse(request.url, true).query;

    if (q.error) {
      return response.status(500).json({ message: "Error", error: q.error });
    }

    const oauth2client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
    let { tokens } = await oauth2client.getToken(q.code as string);
    oauth2client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2client });
    const { data } = await oauth2.userinfo.get(); // Fetch user info

    const user = await UserModel.findOne({ email: data.email });

    data.picture = await base64Image(data.picture!);

    if (user) {

      user.googleId = data.id!;
      user.name = data.name!;
      user.picture = data.picture!;
      const token = createJWT({ _id: user._id });
      await user.save();
      return response.status(300).redirect(APP_DOMAIN + "?token=" + token);

    } else {

      const userData = {
        googleId: data.id!,
        email: data.email!,
        name: data.name!,
        picture: data.picture ?? null,
      };

      const newUser = new UserModel(userData);

      const folderData = {
        userId: newUser._id,
        parentFolderId: "NA",
        name: "root",
        size: 0,
      };

      const rootFolder = new FolderModel(folderData);

      await newUser.save();
      await rootFolder.save();

      newUser.rootFolderId = rootFolder._id;
      newUser.save();
      const token = createJWT({ _id: newUser._id });

      return response.status(300).redirect(APP_DOMAIN + "?token=" + token);
    }
  } catch (error) {
    return response.status(500).json({ message: "Error", error: JSON.stringify(error) });
  }
};

export const accountCallback = async (request: Request, response: Response): Promise<any> => {
  try {
    let q = url.parse(request.url, true).query;

    if (q.error) {
      return response.status(500).json({ message: "Error", error: q.error });
    }
    if (!request.session.userId) {
      return response.status(500).json({ message: "UserID not found in google callback" });
    }

    const oauth2client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
    let { tokens } = await oauth2client.getToken(q.code as string);
    oauth2client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2client });
    const { data } = await oauth2.userinfo.get(); // Fetch user info

    data.picture = await base64Image(data.picture!);

    const user = await UserModel.findById(request.session.userId);

    if (!user) {
      return response.status(502).json({ message: "User not found in Database" });
    }

    const prevAccount = await AccountModel.findOne({ email: data.email });

    if (!prevAccount) {
      const account = new AccountModel({ email: data.email, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: tokens.expiry_date, scope: tokens.scope?.split(" "), userId: user._id , picture:data.picture});
      await account.save();
    } else {
      if (prevAccount.userId.toString() === request.session.userId) {
        await AccountModel.findByIdAndUpdate(prevAccount._id, { email: data.email, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: tokens.expiry_date, scope: tokens.scope?.split(" "), userId: user._id , picture:data.picture });
        return response.status(300).redirect(APP_DOMAIN);
      } else {
        return response.status(409).json({ message: "Account already registered in Drive", email: data.email });
      }
    }

    return response.status(300).redirect(APP_DOMAIN);
  } catch (error: unknown) {
    return response.status(500).json({ message: "Error", error: error });
  }
};
