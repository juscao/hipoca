import { Request, Response } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type UserBody = {
  username: string;
  password: string;
};

const verifyUser = async (req: Request<{}, {}, UserBody>, res: Response) => {
  res.send({ user: req.user });
  return;
};

const signUp = async (req: Request<{}, {}, UserBody>, res: Response) => {
  const { username, password } = req.body;
  try {
    const exists = await prisma.user.findUnique({
      where: { username: username },
    });
    if (exists) {
      res.status(409).json({ error: "Username already taken" });
      return;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "30d" }
      );
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        })
        .json({ id: user.id, username: user.username });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const signIn = async (req: Request<{}, {}, UserBody>, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "30d" }
    );

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ id: user.id, username: user.username });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred during sign-in",
    });
    return;
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res
      .cookie("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0),
      })
      .cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0),
      })
      .status(200)
      .json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred during logout" });
    return;
  }
};

export default { verifyUser, signUp, signIn, logout };
