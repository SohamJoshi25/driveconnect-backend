import jwt from "jsonwebtoken";

export const createJWT = (body: any, expiresIn?: number): String => {
  const expiresInTime = expiresIn ?? 3600 * 24;
  const token = jwt.sign(body, process.env.JWT_SECRET as string, { expiresIn: expiresInTime });
  return token;
};

export const verifyJWT = (token: string): any => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  return decoded;
};
