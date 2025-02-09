//BASE ROUTE -> http://localhost:8080/v1/user
import express from "express";

//Middlewares
import { decodeBearerToken } from "../middlewares/token-middleware.js";

//Controllers
import { UserInfo } from "../controllers/user-controller.js";

const router = express.Router();

router.get("/info", decodeBearerToken, UserInfo);

export default router;
