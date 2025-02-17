export const PORT = process.env.PORT ?? 8080;
export const SERVER_DOMAIN = process.env.NODE_ENV === "DEVELOPMENT" ? ("http://localhost:" + PORT) : "https://driveconnect-backend.onrender.com";
export const GOOGLE_REDIRECT_URL = "http://localhost:8080" + "/v1/auth/google/callback";
export const APP_DOMAIN = process.env.NODE_ENV === "DEVELOPMENT" ? "http://localhost:5173" : "https://driveconnect-app.vercel.app";
