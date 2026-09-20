import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        username: string;
        role: string;
      };
      kioskSessionId?: string;
    }
  }
}


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Invalid token format.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = {
      _id: (decoded as any)._id,
      username: (decoded as any).username,
      role: (decoded as any).role,
    };

    const user = await User.findById((decoded as any)._id).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "User not found or deactivated.",
      });
    }

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please re-authenticate.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token. Authentication failed.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Authentication error. Please try again.",
    });
  }
};


export const authorize = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required.",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Role [${req.user.role}] not authorized for this endpoint.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Authorization error.",
      });
    }
  };
};


export const kioskSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { kioskSessionId } = req.query;

    if (!kioskSessionId || typeof kioskSessionId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Kiosk session ID required.",
      });
    }

    req.kioskSessionId = kioskSessionId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Session verification error.",
    });
  }
};
