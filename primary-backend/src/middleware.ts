import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  id?: number;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
    return;
  }
  const token = authHeader;

  const jwt_secret = process.env.JWT_PASSWORD as string;

  try {
    const payload = jwt.verify(token, jwt_secret) as JwtPayload;
    if (typeof payload.id !== "number") {
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }

    req.id = payload.id;
    next();
  } catch (e) {
    res.status(403).json({
      message: "You are not logged in",
    });
    return;
  }
}
