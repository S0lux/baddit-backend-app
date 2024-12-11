import { NextFunction, Request, Response } from "express";
import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import chatService from "../services/chatService";

const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId, content } = req.body;
        // Assuming the authenticated user's ID is available in the request
        const senderId = req.user?.id;

        if (!senderId) {
            throw new HttpException(HttpStatusCode.UNAUTHORIZED, {
                code: "UNAUTHORIZED",
                message: "User not authenticated"
            });
        }

        const message = await chatService.sendMessage(senderId, channelId, content);

        res.status(HttpStatusCode.CREATED).json(message);
    } catch (error) {
        next(error);
    }
};

const getChannelMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { limit, offset } = req.query;

        // Assuming the authenticated user's ID is available in the request
        const userId = req.user?.id;

        if (!userId) {
            throw new HttpException(HttpStatusCode.UNAUTHORIZED, {
                code: "UNAUTHORIZED",
                message: "User not authenticated"
            });
        }

        // Convert limit and offset to numbers, with default values
        const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
        const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

        const messages = await chatService.getChannelMessages(
            channelId,
            userId,
            parsedLimit,
            parsedOffset
        );

        res.status(HttpStatusCode.SUCCESS).json(
            messages
        );
    } catch (error) {
        next(error);
    }
};

const getOrCreateDirectChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targetUserId } = req.body;

        // Assuming the authenticated user's ID is available in the request
        const currentUserId = req.user?.id;

        if (!currentUserId) {
            throw new HttpException(HttpStatusCode.UNAUTHORIZED, {
                code: "UNAUTHORIZED",
                message: "User not authenticated"
            });
        }

        if (!targetUserId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, {
                code: "MISSING_TARGET_USER",
                message: "Target user ID is required"
            });
        }

        const channel = await chatService.getOrCreateDirectChatChannel(
            currentUserId,
            targetUserId
        );

        res.status(HttpStatusCode.SUCCESS).json(
            channel
        );
    } catch (error) {
        next(error);
    }
};

const getAllChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Assuming the authenticated user's ID is available in the request
        const userId = req.user?.id;

        if (!userId) {
            throw new HttpException(HttpStatusCode.UNAUTHORIZED, {
                code: "UNAUTHORIZED",
                message: "User not authenticated"
            });
        }

        const channels = await chatService.getAllChannels(userId);

        res.status(HttpStatusCode.SUCCESS).json(
            channels
        );
    } catch (error) {
        next(error);
    }
}

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.body;

        if (!channelId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, {
                code: "MISSING_CHANNEL_ID",
                message: "Channel ID is required"
            });
        }

        const mediaUrls = await chatService.uploadFile(req.user!.id, channelId, req.files as Express.Multer.File[]);

        res.status(HttpStatusCode.SUCCESS).json(mediaUrls);

    } catch (error) {
        next(error);
    }
}

const createChatChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelName, memberIds } = req.body;
        const channel = await chatService.createChatChannel(req.user!.id, channelName, memberIds);
        res.status(HttpStatusCode.CREATED).json(channel);
    } catch (err) {
        next(err);
    }
}

const updateChatChannelName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId, name } = req.body;
        const updatedChannel = await chatService.updateChatChannelName(req.user!.id, channelId, name);
        res.status(HttpStatusCode.SUCCESS).json(updatedChannel);
    } catch (error) {
        next(error);
    }
}

const updateChannelAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.body;
        const updatedChannel = await chatService.updateChatChannelAvatar(req.user!.id, channelId, req.file!.path);
        res.status(HttpStatusCode.SUCCESS).json(updatedChannel);
    } catch (error) {
        next(error);
    }
}

const addModeratorsToChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId, moderatorIds } = req.body;
        const updatedChannel = await chatService.addModeratorsToChat(req.user!.id, channelId, moderatorIds);
        res.status(HttpStatusCode.SUCCESS).json(updatedChannel);
    } catch (error) {
        next(error);
    }
}

const addMembersToChatChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId, memberIds } = req.body;
        const updatedChannel = await chatService.addMembersToChatChannel(req.user!.id, channelId, memberIds);
        res.status(HttpStatusCode.SUCCESS).json(updatedChannel);
    } catch (error) {
        next(error);
    }
}

const deleteChatChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const updatedChannel = await chatService.deleteChatChannel(req.user!.id, channelId);
        res.status(HttpStatusCode.SUCCESS).json(updatedChannel);
    } catch (error) {
        next(error);
    }
}

const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { messageId } = req.params;
        const updatedMessage = await chatService.deleteMessage(req.user!.id, messageId);
        res.status(HttpStatusCode.SUCCESS).json(updatedMessage);
    } catch (error) {
        next(error);
    }
}


export const chatController = {
    sendMessage,
    getChannelMessages,
    getOrCreateDirectChannel,
    getAllChannels,
    uploadFile,
    createChatChannel,
    updateChatChannelName,
    updateChannelAvatar,
    addModeratorsToChat,
    addMembersToChatChannel,
    deleteChatChannel,
    deleteMessage
}