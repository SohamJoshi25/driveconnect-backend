import express, { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt-util.js";

export const decodeBearerToken = (request: Request, response: Response, next: NextFunction): any => {
  try {
    const auth_header = request.headers.authorization;

    if (!auth_header) {
      return response.status(403).json({ message: "Token is required" });
    }

    const token = auth_header.split(" ").pop();
    if (!token) {
      return response.status(400).json({ message: "Token is malformed" });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded._id) {
      return response.status(401).json({ message: "Invalid token" });
    }

    request.session.userId = decoded._id;
    return next();
  } catch (error) {
    console.error(error);
    return response.status(401).json({ error: error instanceof Error ? error.message : "Unauthorized" });
  }
};
