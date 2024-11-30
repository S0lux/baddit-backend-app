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

const getNewNotificationsAfter = async (notificationId: string, userId: string) => {
  const notification = await prisma.notifications.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  const newNotifications = await prisma.notifications.findMany({
    where: {
      targetUsers: {
        some: {
          id: userId,
        },
      },
      createdAt: {
        gt: notification.createdAt,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      readBy: true,
    },
  });

  return newNotifications;
};

const getNotificationsForUser = async (userId: string, skip: number = 0, limit: number = 15) => {
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
    skip: skip,
    take: limit,
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

export type BaseNotificationPayload = {
  title: string;
  body: string;
  type?: string;
  typeId?: string;
};

const createNotification = async (
  targetUserIds: string[],
  notificationType: NotificationType,
  payload: BaseNotificationPayload
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

const deleteFcmToken = async (fcmToken: string) => {
  await prisma.fcmTokens.delete({
    where: {
      token: fcmToken,
    },
  });
};

const getUsersFcmTokens = async (userId: string) => {
  return await prisma.fcmTokens.findMany({
    where: {
      userId: userId,
    },
  });
};

export const notificationRepository = {
  createNotification,
  addOrUpdateFcmToken,
  getNotificationById,
  getNotificationsForUser,
  getNewNotificationsAfter,
  markNotificationAsRead,
  deleteFcmToken,
  getUsersFcmTokens,
};
