-- CreateTable
CREATE TABLE "TrackRunOutBox" (
    "id" TEXT NOT NULL,
    "trackOutBoxId" TEXT NOT NULL,

    CONSTRAINT "TrackRunOutBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackRunOutBox_trackOutBoxId_key" ON "TrackRunOutBox"("trackOutBoxId");

-- AddForeignKey
ALTER TABLE "TrackRunOutBox" ADD CONSTRAINT "TrackRunOutBox_trackOutBoxId_fkey" FOREIGN KEY ("trackOutBoxId") REFERENCES "TrackRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
