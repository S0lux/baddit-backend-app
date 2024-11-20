import { NextFunction, Request, Response } from "express";
import notificationService from "../services/notificationService";

const getNotificationsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getNotificationsForUser(userId);
    return res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.notificationId;
    await notificationService.markNotificationAsRead(notificationId, userId);
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};

const createOrUpdateFcmToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const fcmToken = req.body.fcmToken;
    await notificationService.createOrUpdateFcmToken(userId, fcmToken);
    return res.status(200).json({ message: "FCM token updated" });
  } catch (err) {
    next(err);
  }
};

export const notificationController = {
  getNotificationsForUser,
  createOrUpdateFcmToken,
  markNotificationAsRead,
};
