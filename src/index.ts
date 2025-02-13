import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path, { dirname } from "path";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import http from "http";

//config
import { PORT, SOCKET_PORT } from "./configs/constants-config.js";
import { socketConnection } from "./configs/socket-config.js";
import connectDB from "./configs/database-config.js";
connectDB();

//Routers
import AuthRouter from "./routes/auth-router.js";
import { connectIO } from "./routes/socket-router.js";
import FolderRouter from "./routes/folder-router.js";
import FileRouter from "./routes/file-router.js";
import UserRouter from "./routes/user-router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const server = http.createServer(app);
const io = socketConnection(server);
connectIO(io);

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

//Prevent Cacheing in browser
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0 compatibility
  res.setHeader("Expires", "0"); // Forces immediate expiration
  next();
});

//Debugging Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV == "DEVELOPMENT") {
    console.log("DEBUG STATS :\n");
    console.log("URL :" + req.url);
    console.log("METHOD :" + req.method);
    console.log("QUERY :" + JSON.stringify(req.query, null, 2));
    console.log("BODY :" + JSON.stringify(req.body, null, 2));
    console.log("SESSION :" + JSON.stringify(req.session, null, 2));
  }
  next();
});

const v1Router = express.Router();

v1Router.use("/auth", AuthRouter);
v1Router.use("/folder", FolderRouter);
v1Router.use("/file", FileRouter);
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

app.listen(PORT, () => {
  console.log("Server Started on Port ", PORT);
});

server.listen(SOCKET_PORT, () => {
  console.log("Socket listening on Port ", SOCKET_PORT);
});
