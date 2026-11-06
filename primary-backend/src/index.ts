import express from "express";
import { userRouter } from "./router/user";
import { trackRouter } from "./router/track";
import cors from "cors";
import dotenv from "dotenv"
import { triggerRouter } from "./router/trigger";
import { actionRouter } from "./router/action";
import { storyRouter } from "./router/story";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3002", // or your frontend URL
    credentials: true,
  })
);

app.use("/api/v1/user", userRouter);

app.use("/api/v1/track", trackRouter);

app.use("/api/v1/trigger", triggerRouter);

app.use("/api/v1/action", actionRouter);
app.use("/api/v1/stories", storyRouter);

app.listen(3000);
