-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE');

-- AlterTable
ALTER TABLE "ChatMessages" ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT';
