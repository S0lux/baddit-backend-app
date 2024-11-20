import { NotificationType } from "@prisma/client";
import { APP_ERROR_CODE } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { notificationRepository } from "../repositories/notificationRepository";

class notificationService {
  async createNotification(
    targetUserIds: string[],
    notificationType: NotificationType,
    payload: object
  ) {
    if (!targetUserIds || targetUserIds.length == 0 || !notificationType || !payload)
      throw new HttpException(500, APP_ERROR_CODE.invalidNotificationData);

    await notificationRepository.createNotification(targetUserIds, notificationType, payload);

    // Call FCM service to send push notification
  }

  async getNotificationsForUser(userId: string) {
    if (!userId) throw new Error("User id is required");
    const notifications = await notificationRepository.getNotificationsForUser(userId);
    const mappedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      createdAt: notification.createdAt,
      isRead: notification.readBy.some((user) => user.id === userId),
    }));
    return mappedNotifications;
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    if (!notificationId || !userId) throw new HttpException(400, APP_ERROR_CODE.unexpectedBody);

    const isExist = await notificationRepository.getNotificationById(notificationId);
    if (!isExist) throw new HttpException(404, APP_ERROR_CODE.notificationNotFound);
    if (isExist.targetUsers.some((user) => user.id == userId) && isExist.type !== "GLOBAL")
      throw new HttpException(401, APP_ERROR_CODE.insufficientPermissions);

    return await notificationRepository.markNotificationAsRead(notificationId, userId);
  }

  async createOrUpdateFcmToken(userId: string, fcmToken: string) {
    if (!userId || !fcmToken) throw new HttpException(400, APP_ERROR_CODE.unexpectedBody);
    return await notificationRepository.addOrUpdateFcmToken(userId, fcmToken);
  }
}

export default new notificationService();
