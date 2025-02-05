import express from "express";
import dotenv from "dotenv";
import path, { dirname } from "path";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

dotenv.config();

//config
import { PORT } from "./configs/constants-config.js";
import connectDB from "./configs/database-config.js";
connectDB();

//Routers
import AuthRouter from "./routes/auth-router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60000,
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

//Debugging Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV == "DEVELOPMENT") {
    console.log("DEBUG STATS :\n");
    console.log("URL :" + req.url);
    console.log("METHOD :" + req.method);
    console.log("QUERY :" + JSON.stringify(req.query, null, 2));
    console.log("BODY :" + JSON.stringify(req.body, null, 2));
    console.log("SESSION :" + JSON.stringify(req.session, null, 2));
    console.log(req.sessionID + "\n");
  }
  next();
});

app.use("/v1/auth", AuthRouter);

app.get("/health", (request, response) => {
  response.json({ message: "Health OK" });
});

app.get("*", (request, response) => {
  response.status(200).json({
    error: "Endpoint Not Found",
    request: { url: request.url, method: request.method },
  });
});

app.listen(PORT, () => {
  console.log("Server Started on Port ", PORT);
});
