import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
app.use(express.json());

const client = new PrismaClient();

//TODO: Password Logic
app.post("/hooks/catch/:userId/:trackId", (req, res) => {
  const userId = req.params.userId;
  const trackId = req.params.trackId;
  const body = req.body;

  client.$transaction(async (tx) => {
    const run = await tx.trackRun.create({
      data: {
        trackId,
        metadata: body,
      },
    });

    await tx.trackRunOutBox.create({
      data: {
        trackOutBoxId: run.id,
      },
    });
  });

  res.json({
    message: "Metadata reached",
  });
});

app.listen(3001);
