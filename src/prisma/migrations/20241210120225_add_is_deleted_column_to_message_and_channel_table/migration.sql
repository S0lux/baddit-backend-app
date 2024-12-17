-- AlterTable
ALTER TABLE "ChatChannels" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ChatMessages" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
