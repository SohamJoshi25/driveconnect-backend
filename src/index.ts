import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path, { dirname } from "path";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import http from "http";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

//config
import { PORT } from "./configs/constants-config.js";
import { socketConnection } from "./configs/socket-config.js";
import connectDB from "./configs/database-config.js";
connectDB();

//Routers
import AuthRouter from "./routes/auth-router.js";
import { connectIO } from "./routes/socket-router.js";
import FolderRouter from "./routes/folder-router.js";
import FileRouter from "./routes/file-router.js";
import UserRouter from "./routes/user-router.js";
import AccountRouter from "./routes/account-router.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const server = http.createServer(app);
const io = socketConnection(server);
connectIO(io);

app.use(
  cors({
    origin: ["https://driveconnect-app.vercel.app","http://localhost:5173","https://driveconnect.sohamjoshi.in"],
    credentials: true, 
  })
);

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1);

app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGOURI,
      collectionName: "sessions",
    }),
  }),
);

//Prevent Cacheing in browser
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

//Debugging Middleware
app.use((req, res, next) => {
  //if (process.env.NODE_ENV == "DEVELOPMENT") {
    console.log("DEBUG STATS :\n");
    console.log("URL :" + req.url);
    console.log("METHOD :" + req.method);
    console.log("QUERY :" + JSON.stringify(req.query, null, 2));
    console.log("BODY :" + JSON.stringify(req.body, null, 2));
    console.log("SESSION :" + JSON.stringify(req.session, null, 2));
  //}
  next();
});

const v1Router = express.Router();
  v1Router.use("/auth", AuthRouter);
  v1Router.use("/folder", FolderRouter);
  v1Router.use("/file", FileRouter);
  v1Router.use("/account", AccountRouter);
  v1Router.use("/user", UserRouter);

app.use("/v1", v1Router);

app.get("/health", (request, response) => {
  response.json({ message: "Health OK" });
});

app.get("*", (request, response) => {
  response.status(200).json({
    error: "Endpoint Not Found",
    request: { url: request.url, method: request.method },
  });
});

server.listen(PORT, () => {
  console.log("App listening on Port ", PORT);
});
