-- CreateTable
CREATE TABLE "TrackRun" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "TrackRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackRun" ADD CONSTRAINT "TrackRun_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
