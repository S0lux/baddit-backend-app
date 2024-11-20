import { NotificationType, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getNotificationById = async (notificationId: string) => {
  const notification = await prisma.notifications.findUnique({
    where: {
      id: notificationId,
    },
    include: {
      targetUsers: true,
    },
  });

  return notification;
};

const getNotificationsForUser = async (userId: string) => {
  const notifications = await prisma.notifications.findMany({
    where: {
      OR: [
        {
          targetUsers: {
            some: {
              id: userId,
            },
          },
        },
        { type: "GLOBAL" },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      readBy: {
        where: {
          id: userId,
        },
      },
    },
  });

  return notifications;
};

const createNotification = async (
  targetUserIds: string[],
  notificationType: NotificationType,
  payload: object
) => {
  await prisma.notifications.create({
    data: {
      type: notificationType,
      payload: JSON.stringify(payload),
      targetUsers: {
        connect: targetUserIds.map((id) => ({ id })),
      },
    },
  });
};

const markNotificationAsRead = async (notificationId: string, userId: string) => {
  await prisma.notifications.update({
    where: {
      id: notificationId,
      readBy: {
        none: {
          id: userId,
        },
      },
    },
    data: {
      readBy: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

const addOrUpdateFcmToken = async (userId: string, fcmToken: string) => {
  await prisma.fcmTokens.upsert({
    where: {
      userId: userId,
      token: fcmToken,
    },
    create: {
      User: {
        connect: {
          id: userId,
        },
      },
      token: fcmToken,
    },
    update: {
      lastAccessDate: new Date(),
    },
  });
};

export const notificationRepository = {
  createNotification,
  addOrUpdateFcmToken,
  getNotificationById,
  getNotificationsForUser,
  markNotificationAsRead,
};
