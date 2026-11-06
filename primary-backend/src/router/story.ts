import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prismaClient } from "../db";

const router = Router();
const createStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(20).max(20000),
  language: z.string().trim().min(2).max(16).default("en"),
  genre: z.string().trim().max(80).optional(),
});

router.post("/", async (req, res) => {
  const parsed = createStorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid story", errors: parsed.error.flatten() });
  try {
    const story = await prismaClient.$transaction(async (tx) => {
      const created = await tx.story.create({ data: parsed.data });
      await tx.storyOutbox.create({ data: { id: randomUUID(), storyId: created.id } });
      return created;
    });
    return res.status(201).json({ story });
  } catch (error) {
    console.error("Failed to create story", error);
    return res.status(500).json({ message: "Could not create story" });
  }
});

router.get("/:id/similar", async (req, res) => {
  const requestedK = Number(req.query.k ?? 5);
  if (!Number.isInteger(requestedK) || requestedK < 1 || requestedK > 20) {
    return res.status(400).json({ message: "k must be an integer between 1 and 20" });
  }
  try {
    const rows = await prismaClient.$queryRawUnsafe<Array<{ id: string; title: string; text: string; language: string; genre: string | null; mood: string | null; tags: string[]; similarity: number }>>(
      `SELECT candidate."id", candidate."title", candidate."text", candidate."language", candidate."genre", candidate."mood", candidate."tags", 1 - (candidate."embedding" <=> target."embedding") AS similarity
       FROM "Story" target JOIN "Story" candidate ON candidate."id" <> target."id"
       WHERE target."id" = $1 AND target."embedding" IS NOT NULL AND candidate."embedding" IS NOT NULL
       ORDER BY candidate."embedding" <=> target."embedding" LIMIT $2`, req.params.id, requestedK);
    if (rows.length === 0) {
      const exists = await prismaClient.story.findUnique({ where: { id: req.params.id }, select: { id: true } });
      if (!exists) return res.status(404).json({ message: "Story not found" });
      const story = await prismaClient.$queryRawUnsafe<Array<{ enrichmentStatus: string; hasEmbedding: boolean }>>(
        `SELECT "enrichmentStatus", "embedding" IS NOT NULL AS "hasEmbedding" FROM "Story" WHERE "id" = $1`, req.params.id);
      if (story[0]?.hasEmbedding) return res.json({ storyId: req.params.id, count: 0, similar: [] });
      if (story[0]?.enrichmentStatus === "failed") return res.status(503).json({ message: "Story enrichment failed and was sent to the dead-letter queue", status: "failed" });
      return res.status(202).json({ message: "Story is awaiting enrichment", status: story[0]?.enrichmentStatus });
    }
    return res.json({ storyId: req.params.id, count: rows.length, similar: rows });
  } catch (error) {
    console.error("Similar story query failed", error);
    return res.status(500).json({ message: "Could not find similar stories" });
  }
});

export const storyRouter = router;
