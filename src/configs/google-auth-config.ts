import { google } from "googleapis";
import { GOOGLE_REDIRECT_URL } from "./constants-config.js";

import dotenv from "dotenv";
dotenv.config();

const oauth2client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);

export const accountAuthUrl = oauth2client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive.appdata", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  prompt: "consent",
});

export const userAuthUrl = oauth2client.generateAuthUrl({
  scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  prompt: "consent",
});

export const getDrive = (token: string) => {
  const _oauth2client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
  _oauth2client.setCredentials({ refresh_token: token });
  const drive = google.drive({
    version: "v3",
    auth: _oauth2client,
  });
  return drive;
};
