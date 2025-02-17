//BASE ROUTE -> http://localhost:8080/v1/folder
import express from "express";

//Middlewares
import { decodeBearerToken } from "../middlewares/token-middleware.js";

//Controllers
import { accountInfo } from "../controllers/account-controller.js";

const router = express.Router();

router.get("/info", decodeBearerToken, accountInfo);

export default router;
