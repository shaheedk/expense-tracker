/*
  Warnings:

  - Made the column `imageUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Record" DROP CONSTRAINT "Record_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "imageUrl" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
