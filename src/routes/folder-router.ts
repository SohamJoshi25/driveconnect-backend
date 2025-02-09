//BASE ROUTE -> http://localhost:8080/v1/folder
import express from "express";

//Middlewares
import { decodeBearerToken } from "../middlewares/token-middleware.js";

//Controllers
import { folderCreate, folderDelete, folderInfo, folderNestedInfo, folderUpdate } from "../controllers/folder-controller.js";

const router = express.Router();

router.get("/:folderId/info", decodeBearerToken, folderInfo);

router.get("/:folderId/nestedinfo", decodeBearerToken, folderNestedInfo);

router.patch("/:folderId/update", decodeBearerToken, folderUpdate);

router.post("/:parentFolderId/create", decodeBearerToken, folderCreate);

router.delete("/:folderId/delete", decodeBearerToken, folderDelete);

export default router;
