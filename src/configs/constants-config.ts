import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ?? 8080;
export const SERVER_DOMAIN = process.env.NODE_ENV == "DEVELOPMENT" ? ("http://localhost:" + PORT) : "https://driveconnect-backend.onrender.com";
export const GOOGLE_REDIRECT_URL = SERVER_DOMAIN + "/v1/auth/google/callback";
export const APP_DOMAIN = process.env.NODE_ENV == "DEVELOPMENT" ? "http://localhost:5173" : "https://driveconnect.sohamjoshi.in";