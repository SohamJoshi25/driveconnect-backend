export const PORT = process.env.PORT ?? 8080;
export const SERVER_DOMAIN = process.env.NODE_ENV === "DEVELOPMENT" ? "http://localhost:" + PORT : "https://sterling-feline-glowing.ngrok-free.app";
export const GOOGLE_REDIRECT_URL = "http://localhost:8080" + "/v1/auth/google/callback";
