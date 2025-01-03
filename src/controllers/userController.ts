import { NextFunction, Request, Response } from "express";
import userService from "../services/userService";
import { HttpException } from "../exception/httpError";
import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import communityService from "../services/communityService";
import { reformatters } from "../utils/reformatters";
import postService from "../services/postService";
import commentService from "../services/commentService";

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new HttpException(HttpStatusCode.UNAUTHORIZED, APP_ERROR_CODE.notLoggedIn);
    }

    const user = req.user;
    const userId = user!.id;
    const queries = { userId };
    const rawCommunities = await communityService.getAllCommunitiesJoined(queries);
    const communities = reformatters.reformatUserCommunities(rawCommunities);

    const getUser = await userService.getUserById(userId);
    if (getUser?.status === "SUSPENDED")
      throw new HttpException(HttpStatusCode.FORBIDDEN, APP_ERROR_CODE.userSuspended);

    const result = { ...user, status: getUser!.status, communities };

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getOther = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username;
  try {
    const user = await userService.getUserByUserName(username);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const getOtherPosts = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username;
  try {
    const authorName = username;
    const queries = { authorName };
    const posts = await postService.getPostsWithQueries(queries);
    res.status(200).json(reformatters.reformatPosts(posts));
  } catch (err) {
    next(err);
  }
};

const getOtherComments = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username;
  try {
    const authorName = username;
    const queries = { authorName };
    const comments = await commentService.getCommentsWithQueries(queries);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.missingMedia);
    }

    await userService.updateUserAvatar(req.user!.id, req.file.path);

    res.status(200).json({ message: "Avatar updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const userController = {
  getMe,
  getOther,
  getOtherComments,
  getOtherPosts,
  updateAvatar,
};
