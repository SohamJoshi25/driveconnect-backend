//BASE ROUTE -> http://localhost:8080/v1/file
import express from "express";

//Middlewares
import { decodeBearerToken } from "../middlewares/token-middleware.js";

//Controllers
import { fileInfo, fileUpdate, fileDelete } from "../controllers/file-controller.js";

const router = express.Router();

router.get("/:fileId/info", decodeBearerToken, fileInfo);

router.patch("/:fileId/update", decodeBearerToken, fileUpdate);

router.delete("/:fileId/delete", decodeBearerToken, fileDelete);

export default router;
