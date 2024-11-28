import { APP_ERROR_CODE } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { friendRepository } from "../repositories/friendRepostory";

class friendService {
  async getFriends(userId: string) {
    const currentFriends = await friendRepository.getUserFriends(userId);
    const incomingRequests = await friendRepository.getIncomingRequestsForUser(userId);
    const outgoingRequests = await friendRepository.getOutgoingRequestsForUser(userId);
    return { currentFriends, incomingRequests, outgoingRequests };
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    const currentRelation = await friendRepository.getUsersRelation(senderId, receiverId);
    if (currentRelation === "FRIEND") throw new HttpException(400, APP_ERROR_CODE.alreadyFriended);
    if (currentRelation === "BLOCKED") throw new HttpException(403, APP_ERROR_CODE.blocked);

    const friendRequest = await friendRepository.createFriendRequest(senderId, receiverId);
    return friendRequest;
  }

  async cancelFriendRequest(senderId: string, receiverId: string) {
    const currentRelation = await friendRepository.getUsersRelation(senderId, receiverId);
    if (currentRelation === "FRIEND") throw new HttpException(400, APP_ERROR_CODE.alreadyFriended);
    if (currentRelation === "BLOCKED") throw new HttpException(403, APP_ERROR_CODE.blocked);

    await friendRepository.cancelFriendRequest(senderId, receiverId);
  }

  async acceptFriendRequest(requesterId: string, targetId: string) {
    const currentRelation = await friendRepository.getUsersRelation(requesterId, targetId);
    if (currentRelation === "FRIEND") throw new HttpException(400, APP_ERROR_CODE.alreadyFriended);
    if (currentRelation === "BLOCKED") throw new HttpException(403, APP_ERROR_CODE.blocked);

    await friendRepository.acceptFriendRequest(requesterId, targetId);
  }

  async rejectFriendRequest(requesterId: string, targetId: string) {
    const currentRelation = await friendRepository.getUsersRelation(requesterId, targetId);
    if (currentRelation === "FRIEND") throw new HttpException(400, APP_ERROR_CODE.alreadyFriended);
    if (currentRelation === "BLOCKED") throw new HttpException(403, APP_ERROR_CODE.blocked);

    await friendRepository.rejectFriendRequest(requesterId, targetId);
  }

  async removeFriend(userId: string, otherUserId: string) {
    const currentRelation = await friendRepository.getUsersRelation(userId, otherUserId);
    if (currentRelation != "FRIEND") throw new HttpException(400, APP_ERROR_CODE.notFriended);
    await friendRepository.removeFriendRelation(userId, otherUserId);
  }
}

export default new friendService();
