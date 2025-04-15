import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string };
    }
  }
}

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      res.status(401).json({ error: "No access token provided" });
      return;
    }
    try {
      const data = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;

      req.user = { id: data.id, username: data.username };
      return next();
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          res.status(401).json({ error: "No refresh token provided." });
          return;
        }
        try {
          const user = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
          ) as JwtPayload;
          if (!user || typeof user === "string") {
            res.status(403).json({ error: "Invalid user payload." });
            return;
          }
          const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
          );
          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          req.user = { id: user.id, username: user.username };
          return next();
        } catch (refreshError) {
          res.status(403).json({ error: "Invalid refresh token." });
          return;
        }
      } else {
        res.status(403).json({ error: "Invalid access token." });
        return;
      }
    }
  } catch (unexpectedError) {
    console.error("Authentication error:", unexpectedError);
    res
      .status(500)
      .json({ error: "Authentication failed due to server error." });
    return;
  }
};

export default authenticateToken;
