import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { chatRepository } from "../repositories/chatRepository";
import { friendRequestRepository } from "../repositories/friendRequestRepository";

class FriendRequestsService {
    async sendFriendRequest(senderId: string, receiverId: string) {
        // Validate input
        if (!senderId || !receiverId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        // Check if request already exists
        const existingRequest = await friendRequestRepository.getFriendRequestsBySenderId(senderId)
        const duplicateRequest = existingRequest.find(req => req.receiverId === receiverId)

        if (duplicateRequest) {
            throw new HttpException(HttpStatusCode.CONFLICT, {
                code: "FRIEND_REQUEST_ALREADY_SENT",
                message: "A friend request to this user already exists"
            });
        }

        try {
            return await friendRequestRepository.createFriendRequest(senderId, receiverId)
        } catch (error) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async acceptFriendRequest(requestId: string, receiverId: string) {
        // Validate input
        if (!requestId || !receiverId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            const request = await friendRequestRepository.updateFriendRequestStatus(requestId, 'ACCEPTED')

            if (!request) {
                throw new HttpException(HttpStatusCode.NOT_FOUND, {
                    code: "FRIEND_REQUEST_NOT_FOUND",
                    message: "Friend request not found"
                });
            }

            // Create friend relations
            await friendRequestRepository.createFriendRelation(request.senderId, request.receiverId)
            await friendRequestRepository.createFriendRelation(request.receiverId, request.senderId)

            // Create a chat channel for the two friends
            const chatChannel = await chatRepository.createDirectChatChannel(
                request.senderId,
                request.receiverId
            )

            return { request, chatChannel }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async rejectFriendRequest(requestId: string) {
        // Validate input
        if (!requestId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            const request = await friendRequestRepository.updateFriendRequestStatus(requestId, 'REJECTED')

            if (!request) {
                throw new HttpException(HttpStatusCode.NOT_FOUND, {
                    code: "FRIEND_REQUEST_NOT_FOUND",
                    message: "Friend request not found"
                });
            }

            return request
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async getFriendRequests(userId: string, type: 'sent' | 'received') {
        // Validate input
        if (!userId || !type) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            return type === 'sent'
                ? await friendRequestRepository.getFriendRequestsBySenderId(userId)
                : await friendRequestRepository.getFriendRequestsByReceiverId(userId)
        } catch (error) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async getFriends(userId: string) {
        // Validate input
        if (!userId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            return await friendRequestRepository.getFriends(userId)
        } catch (error) {
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }

    async removeFriend(userId: string, friendId: string) {
        // Validate input
        if (!userId || !friendId) {
            throw new HttpException(HttpStatusCode.BAD_REQUEST, APP_ERROR_CODE.unexpectedBody);
        }

        try {
            const result = await friendRequestRepository.removeFriendRelation(userId, friendId)

            if (result.count === 0) {
                throw new HttpException(HttpStatusCode.NOT_FOUND, {
                    code: "FRIEND_NOT_FOUND",
                    message: "Friend relationship not found"
                });
            }

            return result
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
        }
    }
}

export default new FriendRequestsService();