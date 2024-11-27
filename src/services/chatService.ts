import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { chatRepository } from "../repositories/chatRepository";

class ChatMessageService {
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
}

export default new ChatMessageService();