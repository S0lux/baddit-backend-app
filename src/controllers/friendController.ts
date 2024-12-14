import { NextFunction, Request, Response } from "express";
import friendService from "../services/friendService";
import notificationService from "../services/notificationService";

const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentFriends = await friendService.getFriends(req.params.userId);
    res.status(200).json(currentFriends);
  } catch (error) {
    next(error);
  }
};

const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await friendService.sendFriendRequest(req.user!.id, req.params.userId);

    await notificationService.createNotification(
      [req.params.userId],
      "FRIEND_REQUEST",
      {
        type: "FRIEND_REQUEST",
        title: "Friend request",
        body: `${req.user!.username} sent you a friend request`,
        typeId: req.user!.id,
      },
      {
        title: "Friend request",
        body: `${req.user!.username} sent you a friend request`,
        clickAction: "FRIEND_REQUEST",
      }
    );

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    next(error);
  }
};

const cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await friendService.cancelFriendRequest(req.user!.id, req.params.userId);
    res.status(200).json({ message: "Friend request canceled" });
  } catch (error) {
    next(error);
  }
};

const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await friendService.acceptFriendRequest(req.params.userId, req.user!.id);

    await notificationService.createNotification(
      [req.params.userId],
      "FRIEND_REQUEST",
      {
        type: "FRIEND_REQUEST",
        title: "Friend request accepted",
        body: `${req.user!.username} has accepted your friend request`,
        typeId: req.user!.id,
      },
      {
        title: "Friend request",
        body: `${req.user!.username} has accepted your friend request`,
      }
    );

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    next(error);
  }
};

const rejectFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await friendService.rejectFriendRequest(req.params.userId, req.user!.id);
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    next(error);
  }
};

const removeFriend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await friendService.removeFriend(req.user!.id, req.params.userId);
    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    next(error);
  }
};

export const friendController = {
  getFriends,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
};
