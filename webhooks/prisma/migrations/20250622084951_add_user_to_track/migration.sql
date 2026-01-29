-- Step 1: Add `userId` as nullable first
ALTER TABLE "Track" ADD COLUMN "userId" INTEGER;

-- Step 2: Temporarily set userId for existing rows (set to an existing user's ID, like 1)
-- ⚠ Make sure a user with id=1 exists
UPDATE "Track" SET "userId" = 1 WHERE "userId" IS NULL;

-- Step 3: Alter the column to NOT NULL
ALTER TABLE "Track" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Add the foreign key constraint to User(id)
ALTER TABLE "Track"
ADD CONSTRAINT "Track_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
