CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Story" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "genre" TEXT,
  "mood" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "enrichedAt" TIMESTAMP(3),
  "enrichmentStatus" TEXT NOT NULL DEFAULT 'pending',
  "embedding" vector(768),
  CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryOutbox" (
  "id" TEXT NOT NULL,
  "storyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryOutbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StoryOutbox_storyId_key" UNIQUE ("storyId"),
  CONSTRAINT "StoryOutbox_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Story_embedding_hnsw_idx" ON "Story" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX "Story_genre_idx" ON "Story"("genre");
