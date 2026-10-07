import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is required");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  let payload: JwtPayload;
  try {
    const verified = jwt.verify(token, secret);
    if (typeof verified === "string") {
      throw new ApiError(401, "Invalid authentication token");
    }
    payload = verified;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  if (!payload.sub || !payload.jti || !payload.exp) {
    throw new ApiError(401, "Invalid authentication token");
  }

  const revokedToken = await prisma.revokedToken.findUnique({
    where: { tokenId: payload.jti }
  });
  if (revokedToken) {
    throw new ApiError(401, "Authentication token has been revoked");
  }

  req.auth = {
    userId: payload.sub,
    tokenId: payload.jti,
    expiresAt: new Date(payload.exp * 1000)
  };
  next();
}