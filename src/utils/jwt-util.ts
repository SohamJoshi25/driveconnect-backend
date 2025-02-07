import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const createJWT = (body: any, expiresIn?: number): string => {
  const expiresInTime = expiresIn ?? 86400;
  const token = jwt.sign(body, process.env.JWT_SECRET as string, { expiresIn: expiresInTime });
  return token;
};

export const verifyJWT = (token: string): any => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  return decoded;
};
