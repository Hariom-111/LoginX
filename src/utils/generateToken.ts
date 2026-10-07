import { randomUUID } from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";

export function generateToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const tokenId = randomUUID();
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
  const accessToken = jwt.sign({}, secret, {
    subject: userId,
    jwtid: tokenId,
    expiresIn
  });

  return { accessToken, tokenId };
}