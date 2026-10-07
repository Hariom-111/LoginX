import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/generateToken";
import { sendSuccess } from "../utils/sendSuccess";

const SALT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string" || !username.trim()) {
    throw new ApiError(400, "username and password are required");
  }

  const value = username.trim();
  const isEmail = value.includes("@");
  if (isEmail && !EMAIL_PATTERN.test(value)) {
    throw new ApiError(400, "Enter a valid email address");
  }

  const normalizedEmail = isEmail ? value.toLowerCase() : undefined;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: value },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
      ]
    }
  });

  let authenticatedUser: NonNullable<typeof user>;
  let statusCode = 200;

  if (user) {
    authenticatedUser = user;
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid credentials");
    }
  } else {
    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    authenticatedUser = await prisma.user.create({
      data: {
        username: isEmail ? null : value,
        email: normalizedEmail ?? null,
        passwordHash
      }
    });
    statusCode = 201;
  }

  const { accessToken } = generateToken(authenticatedUser.id);
  return sendSuccess(res, statusCode, "Login successful", {
    accessToken,
    user: {
      id: authenticatedUser.id,
      username: authenticatedUser.username
    }
  });
}

export async function logout(req: Request, res: Response) {
  if (!req.auth) {
    throw new ApiError(401, "Authentication is required");
  }

  await prisma.revokedToken.create({
    data: {
      tokenId: req.auth.tokenId,
      expiresAt: req.auth.expiresAt
    }
  });
  return sendSuccess(res, 200, "Logged out successfully", null);
}