-- AlterTable
ALTER TABLE "ChatChannels" ADD COLUMN     "avatarUrl" TEXT NOT NULL DEFAULT 'https://placehold.co/400.png';

-- CreateTable
CREATE TABLE "_IsChatModeratorOfChannel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IsChatModeratorOfChannel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IsChatModeratorOfChannel_B_index" ON "_IsChatModeratorOfChannel"("B");

-- AddForeignKey
ALTER TABLE "_IsChatModeratorOfChannel" ADD CONSTRAINT "_IsChatModeratorOfChannel_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatChannels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IsChatModeratorOfChannel" ADD CONSTRAINT "_IsChatModeratorOfChannel_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
