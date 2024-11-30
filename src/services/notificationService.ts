import { FcmTokens, NotificationType } from "@prisma/client";
import { APP_ERROR_CODE } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import {
  BaseNotificationPayload,
  notificationRepository,
} from "../repositories/notificationRepository";
import { differenceInDays } from "date-fns";
import {
  AndroidNotification,
  getMessaging,
  MulticastMessage,
  TopicMessage,
} from "firebase-admin/messaging";

class notificationService {
  async createNotification(
    targetUserIds: string[],
    notificationType: NotificationType,
    payload: BaseNotificationPayload,
    androidNotification: AndroidNotification
  ) {
    if (!targetUserIds || targetUserIds.length == 0 || !notificationType || !payload)
      throw new HttpException(500, APP_ERROR_CODE.invalidNotificationData);

    await notificationRepository.createNotification(targetUserIds, notificationType, payload);

    // Call FCM service to send push notification
    const staleTokens: FcmTokens[] = [];
    const validTokens: FcmTokens[] = [];
    const usersTokensPromises = targetUserIds.map(async (userId) => {
      return notificationRepository.getUsersFcmTokens(userId);
    });

    if (notificationType === "GLOBAL") {
      var topicMessage: TopicMessage = {
        topic: "GlobalNotifications",
        android: {
          notification: androidNotification,
        },
        data: payload,
      };

      getMessaging().send(topicMessage);
      return;
    }

    // Fetch all tokens for each user ids
    const usersTokens = await Promise.all(usersTokensPromises);

    // Filter out any stale tokens
    usersTokens.forEach((userTokens) => {
      userTokens.forEach((token) => {
        const tokenAge = differenceInDays(new Date(), token.lastAccessDate);
        if (tokenAge >= 30) {
          staleTokens.push(token);
        } else validTokens.push(token);
      });
    });

    // Delete stale tokens
    staleTokens.forEach((staleToken) => notificationRepository.deleteFcmToken(staleToken.token));

    // If there is no valid tokens, return
    if (validTokens.length == 0) return;

    // Send push notification
    var message: MulticastMessage = {
      tokens: validTokens.map((token) => token.token),
      android: {
        notification: androidNotification,
      },
      data: payload,
    };
    await getMessaging().sendEachForMulticast(message);
  }

  async getNotificationsForUser(userId: string, skip?: number, limit?: number) {
    if (!userId) throw new Error("User id is required");
    const notifications = await notificationRepository.getNotificationsForUser(userId, skip, limit);
    const mappedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      payload: JSON.parse(notification.payload!.toString()),
      createdAt: notification.createdAt,
      isRead: notification.readBy.some((user) => user.id === userId),
    }));
    return mappedNotifications;
  }

  async getNotificationsAfter(notificationId: string, userId: string) {
    const notifications = await notificationRepository.getNewNotificationsAfter(
      notificationId,
      userId
    );
    const mappedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      payload: JSON.parse(notification.payload!.toString()),
      createdAt: notification.createdAt,
      isRead: notification.readBy.some((user) => user.id === userId),
    }));
    return mappedNotifications;
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    if (!notificationId || !userId) throw new HttpException(400, APP_ERROR_CODE.unexpectedBody);

    const isExist = await notificationRepository.getNotificationById(notificationId);
    if (!isExist) throw new HttpException(404, APP_ERROR_CODE.notificationNotFound);
    if (!isExist.targetUsers.some((user) => user.id == userId) && isExist.type !== "GLOBAL") {
      throw new HttpException(401, APP_ERROR_CODE.insufficientPermissions);
    }

    return await notificationRepository.markNotificationAsRead(notificationId, userId);
  }

  async createOrUpdateFcmToken(userId: string, fcmToken: string) {
    if (!userId || !fcmToken) throw new HttpException(400, APP_ERROR_CODE.unexpectedBody);
    return await notificationRepository.addOrUpdateFcmToken(userId, fcmToken);
  }
}

export default new notificationService();
