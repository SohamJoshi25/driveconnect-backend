import { Request, Response } from "express";
import { google } from "googleapis";
import mongoose, { Error } from "mongoose";

//configs
import { accountAuthUrl, userAuthUrl } from "../configs/google-auth-config.js";
import { GOOGLE_REDIRECT_URL } from "../configs/constants-config.js";

//models
import { UserModel } from "../models/user-model.js";
import { AccountModel } from "../models/account-model.js";

//Utils
import { createJWT, verifyJWT } from "../utils/jwt-util.js";

//Packages
import url from "url";

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

    const userData = {
      googleId: data.id!,
      email: data.email!,
      name: data.name!,
      picture: data.picture ?? null,
    };

    if (data.picture) {
      userData.picture = data.picture;
    }

    const user = await UserModel.findOneAndReplace({ email: data.email }, userData, { upsert: true, new: true });
    const token = createJWT({ _id: user._id });
    return response.status(200).json({ message: "success", token: token });
  } catch (error) {
    return response.status(500).json({ message: "Error", error: error });
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

    const user = await UserModel.findById(request.session.userId);

    if (!user) {
      return response.status(502).json({ message: "User not found in Database" });
    }
    const account = new AccountModel({ email: data.email, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: tokens.expiry_date, scope: tokens.scope });
    await account.save();

    user.accounts.push(new mongoose.Types.ObjectId(account._id));

    await user.save();

    return response.status(200).json({ message: "success" });
  } catch (error: unknown) {
    if ((error as any).code == 11000) {
      return response.status(409).json({ message: "Email already registered in Drive", email: (error as any).keyValue.email });
    } else {
      return response.status(500).json({ message: "Error", error: error });
    }
  }
};
