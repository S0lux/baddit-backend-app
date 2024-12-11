import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { chatRepository } from "../repositories/chatRepository";

class ChatChannelService {
    async getOrCreateDirectChatChannel(userId1: string, userId2: string) {
        // Validate input
        if (!userId1 || !userId2) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            // Ensure users are different
            if (userId1 === userId2) {
                throw new HttpException(HttpStatusCode.BAD_REQUEST, {
                    code: "SAME_USER",
                    message: "Cannot create a chat channel with the same user"
                });
            }

            // Get or create the channel
            const channel = await chatRepository.getOrCreateDirectChatChannel(userId1, userId2);

            return channel;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async createChatChannel(userId: string, name: string, memberIds: string[]) {
        try {
            return await chatRepository.createChatChannel(userId, name, memberIds);
        } catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async sendMessage(senderId: string, channelId: string, content: string) {
        // Validate input
        if (!senderId || !channelId || !content) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            // Check if sender is a member of the channel
            const isMember = await chatRepository.checkChannelMembership(senderId, channelId);

            if (!isMember) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MEMBER",
                    message: "You are not a member of this chat channel"
                });
            }

            // Send message
            const message = await chatRepository.createMessage(senderId, channelId, content);

            return message;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async getChannelMessages(channelId: string, userId: string, limit: number = 50, offset: number = 0) {
        // Validate input
        if (!channelId || !userId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            // Check if user is a member of the channel
            const isMember = await chatRepository.checkChannelMembership(userId, channelId);

            if (!isMember) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MEMBER",
                    message: "You are not a member of this chat channel"
                });
            }

            // Fetch messages
            return await chatRepository.getChannelMessages(channelId, limit, offset);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async getAllChannels(userId: string) {
        // Validate input
        if (!userId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }
        try {
            // Fetch all channels
            return await chatRepository.getAllChannels(userId);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async uploadFile(senderId: string, channelId: string, mediaArray?: Express.Multer.File[]) {
        // Validate input
        if (!senderId || !channelId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        if (!mediaArray || mediaArray.length === 0) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.missingMedia);
        }

        try {
            // Check if sender is a member of the channel
            const isMember = await chatRepository.checkChannelMembership(senderId, channelId);

            if (!isMember) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MEMBER",
                    message: "You are not a member of this chat channel"
                });
            }

            return mediaArray.map((file) => file.path);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async updateChatChannelName(userId: string, channelId: string, name: string) {
        try {
            const isAllowToUpdate = await chatRepository.checkParticipantPermission(userId, channelId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MODERATOR",
                    message: "You are not a moderator of this chat channel"
                });
            }
            return await chatRepository.updateChatChannelName(channelId, name);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async updateChatChannelAvatar(userId: string, channelId: string, avatarUrl: string) {
        try {
            const isAllowToUpdate = await chatRepository.checkParticipantPermission(userId, channelId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MODERATOR",
                    message: "You are not a moderator of this chat channel"
                });
            }
            return await chatRepository.updateChatChannelAvatar(channelId, avatarUrl);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async addModeratorsToChat(userId: string, channelId: string, moderatorIds: string[]) {
        try {
            const isAllowToUpdate = await chatRepository.checkParticipantPermission(userId, channelId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MODERATOR",
                    message: "You are not a moderator of this chat channel"
                });
            }
            return await chatRepository.addMembersToChatChannel(channelId, moderatorIds);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }
    async addMembersToChatChannel(userId: string, channelId: string, memberIds: string[]) {
        try {
            const isAllowToUpdate = await chatRepository.checkParticipantPermission(userId, channelId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MODERATOR",
                    message: "You are not a moderator of this chat channel"
                });
            }
            return await chatRepository.addMembersToChatChannel(channelId, memberIds);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async deleteChatChannel(userId: string, channelId: string) {
        try {
            const isAllowToUpdate = await chatRepository.checkParticipantPermission(userId, channelId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_CHANNEL_MODERATOR",
                    message: "You are not a moderator of this chat channel"
                });
            }
            return await chatRepository.deleteChatChannel(channelId);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async deleteMessage(userId: string, messageId: string) {
        try {
            const isAllowToUpdate = await chatRepository.checkMessagePermission(userId, messageId);
            if (isAllowToUpdate === false) {
                throw new HttpException(HttpStatusCode.FORBIDDEN, {
                    code: "NOT_MESSAGE_OWNER",
                    message: "You are not the owner of this message"
                });
            }
            return await chatRepository.deleteMessage(messageId);
        }
        catch (err) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }
}

export default new ChatChannelService();