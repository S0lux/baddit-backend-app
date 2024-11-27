import { CommunityRole, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const createFriendRequest = async (senderId: string, receiverId: string) => {
    return prisma.friendRequests.create({
        data: {
            senderId,
            receiverId
        }
    })
}

const getFriendRequestsBySenderId = async (senderId: string) => {
    return prisma.friendRequests.findMany({
        where: { senderId },
        include: { receiver: true }
    })
}

const getFriendRequestsByReceiverId = async (receiverId: string) => {
    return prisma.friendRequests.findMany({
        where: { receiverId },
        include: { sender: true }
    })
}

const updateFriendRequestStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    return prisma.friendRequests.update({
        where: { id: requestId },
        data: { status }
    })
}

const createFriendRelation = async (userId: string, targetUserId: string) => {
    return prisma.userRelations.create({
        data: {
            userId,
            targetUserId,
            relation: 'FRIEND'
        }
    })
}

const getFriends = async (userId: string) => {
    return prisma.userRelations.findMany({
        where: {
            userId,
            relation: 'FRIEND'
        },
        include: { targetUser: true }
    })
}

const removeFriendRelation = async (userId: string, friendId: string) => {
    return prisma.userRelations.deleteMany({
        where: {
            OR: [
                { userId, targetUserId: friendId },
                { userId: friendId, targetUserId: userId }
            ],
            relation: 'FRIEND'
        }
    })
}

export const friendRequestRepository = {
    createFriendRequest,
    getFriendRequestsBySenderId,
    getFriendRequestsByReceiverId,
    updateFriendRequestStatus,
    createFriendRelation,
    getFriends,
    removeFriendRelation
}