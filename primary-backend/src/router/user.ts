import { Router } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_PASSWORD = process.env.JWT_PASSWORD as string;
const router = Router();
const SALT_ROUNDS = 10;

router.post("/signup", async (req, res) => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (userExists) {
    res.status(403).json({
      message: "User already exists",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(
    parsedData.data.password,
    SALT_ROUNDS
  );

  await prismaClient.user.create({
    data: {
      email: parsedData.data.email,
      password: hashedPassword,
      name: parsedData.data.name,
    },
  });

  res.json({
    message: "Please verify your account by checking your email",
  });
});

router.post("/signin", async (req, res) => {
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (!user) {
    res.status(403).json({
      message: "Sorry, credentials are incorrect",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    parsedData.data.password,
    user.password
  );

  if (!isPasswordValid) {
    res.status(403).json({
      message: "Sorry, credentials are incorrect",
    });
    return;
  }

  const token = jwt.sign({ id: user.id }, JWT_PASSWORD);

  res.json({
    token,
  });
});

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  res.json({ user });
});

export const userRouter = router;
