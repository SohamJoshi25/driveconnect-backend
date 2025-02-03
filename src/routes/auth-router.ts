import express, { Request, Response } from "express";

//Controllers
import { userLogin, accountLogin, userCallback, accountCallback } from "../controllers/auth-controller.js";

const router = express.Router();

//User Login
router.get("/userlogin", userLogin);

//Account Add in User
router.get("/accountlogin", accountLogin);

//User Callback
router.get("/google/callback", async (request: Request, response: Response): Promise<any> => {
  const operation = request.session?.operation;

  if (operation) {
    if (operation === "userLogin") {
      return userCallback(request, response);
    } else if (operation === "accountLogin") {
      return accountCallback(request, response);
    }
  }

  return response.status(500).json({ message: "ERROR: Session missing from Google callback" });
});

export default router;
