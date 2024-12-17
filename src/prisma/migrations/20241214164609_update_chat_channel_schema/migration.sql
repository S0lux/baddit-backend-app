-- CreateEnum
CREATE TYPE "ChatChannelType" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable
ALTER TABLE "ChatChannels" ADD COLUMN     "type" "ChatChannelType" NOT NULL DEFAULT 'DIRECT';
