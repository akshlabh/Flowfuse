import { Router, Response, Request } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware";
import { trackCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

// POST /api/track
router.post(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.id;
    const body = req.body;
    const parsedData = trackCreateSchema.safeParse(body);

    if (!parsedData.success) {
      res.status(411).json({
        message: "Incorrect inputs",
      });
      return;
    }

    try {
      const trackId = await prismaClient.$transaction(async (tx) => {
        const track = await tx.track.create({
          data: {
            userId: id as number,
            name: parsedData.data.name,
            triggerId: "",
            Actions: {
              create: parsedData.data.actions.map((x, index) => ({
                actiontypeId: x.availableActionId,
                sortingOrder: index,
                metadata: x.actionMetadata,
              })),
            },
          },
        });

        const trigger = await tx.trigger.create({
          data: {
            triggertypeId: parsedData.data.availableTriggerId,
            trackId: track.id,
          },
        });

        await tx.track.update({
          where: {
            id: track.id,
          },
          data: {
            triggerId: trigger.id,
          },
        });

        track.id;
        return;
      });

      res.json({ message: "Track created successfully", trackId });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      return;
    }
  }
);

// GET /api/track
router.get(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.id;

    try {
      const tracks = await prismaClient.track.findMany({
        where: {
          userId: id,
        },
        include: {
          Actions: {
            include: {
              type: true,
            },
          },
          trigger: {
            include: {
              triggertype: true,
            },
          },
        },
      });

      res.json({ tracks });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      return;
    }
  }
);

// GET /api/track/:trackId
router.get(
  "/:trackId",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.id;
    const trackId = req.params.trackId;

    try {
      const track = await prismaClient.track.findFirst({
        where: {
          id: trackId,
          userId: id,
        },
        include: {
          Actions: {
            include: {
              type: true,
            },
          },
          trigger: {
            include: {
              triggertype: true,
            },
          },
        },
      });

      res.json({ track });
      return;
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      return;
    }
  }
);

export const trackRouter = router;
