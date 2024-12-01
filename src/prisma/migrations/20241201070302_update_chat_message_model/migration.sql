-- AlterTable
ALTER TABLE "ChatMessages" ADD COLUMN     "mediaUrls" TEXT[];

-- AlterTable
ALTER TABLE "_IsChatMemberOfChannel" ADD CONSTRAINT "_IsChatMemberOfChannel_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_IsChatMemberOfChannel_AB_unique";

-- AlterTable
ALTER TABLE "_NotificationReadBy" ADD CONSTRAINT "_NotificationReadBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NotificationReadBy_AB_unique";

-- AlterTable
ALTER TABLE "_NotificationTargets" ADD CONSTRAINT "_NotificationTargets_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NotificationTargets_AB_unique";

-- AlterTable
ALTER TABLE "_SubscribedToComment" ADD CONSTRAINT "_SubscribedToComment_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubscribedToComment_AB_unique";

-- AlterTable
ALTER TABLE "_SubscribedToPost" ADD CONSTRAINT "_SubscribedToPost_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubscribedToPost_AB_unique";
