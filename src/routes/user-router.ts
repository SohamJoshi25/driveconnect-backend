//BASE ROUTE -> http://localhost:8080/v1/user
import express from "express";

//Middlewares
import { decodeBearerToken } from "../middlewares/token-middleware.js";

//Controllers
import { UserInfo, flushUserData } from "../controllers/user-controller.js";

const router = express.Router();

router.get("/info", decodeBearerToken, UserInfo);
router.delete("/flushfiles", decodeBearerToken, flushUserData);

export default router;
