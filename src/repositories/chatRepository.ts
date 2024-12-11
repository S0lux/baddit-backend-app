import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createDirectChatChannel = async (userId1: string, userId2: string) => {
    return await prisma.chatChannels.create({
        data: {
            name: `Chat between ${userId1} and ${userId2}`,
            members: {
                connect: [
                    { id: userId1 },
                    { id: userId2 }
                ]
            }
        },
        include: {
            members: true
        }
    })
}

const createChatChannel = async (userId: string, name: string, memberIds: string[]) => {
    return await prisma.chatChannels.create({
        data: {
            name,
            members: {
                connect: memberIds.map(id => ({ id }))
            }
        },
        include: {
            members: true
        }
    })
}

const getOrCreateDirectChatChannel = async (userId1: string, userId2: string) => {
    // First, try to find an existing direct chat channel between these two users
    const existingChannel = await prisma.chatChannels.findFirst({
        where: {
            AND: [
                { members: { some: { id: userId1 } } },
                { members: { some: { id: userId2 } } }
            ]
        },
        include: {
            members: true
        }
    });

    // If channel exists, return it
    if (existingChannel) {
        return existingChannel;
    }

    // If no existing channel, create a new one
    return await prisma.chatChannels.create({
        data: {
            name: `Chat between ${userId1} and ${userId2}`,
            members: {
                connect: [
                    { id: userId1 },
                    { id: userId2 }
                ]
            }
        },
        include: {
            members: true
        }
    });
}

const createMessage = async (senderId: string, channelId: string, content: string) => {
    return await prisma.chatMessages.create({
        data: {
            senderId,
            channelId,
            content
        },
        include: {
            sender: true
        }
    })
}

const createMediaMessage = async (senderId: string, channelId: string, mediaUrls: string[]) => {
    return await prisma.chatMessages.create({
        data: {
            senderId,
            channelId,
            content: "<MediaMessage>",
            type: "IMAGE",
            mediaUrls: mediaUrls
        },
        include: {
            sender: true
        }
    })
}

const getChannelMessages = async (channelId: string, limit: number, offset: number) => {
    return await prisma.chatMessages.findMany({
        where: { channelId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
            sender: true
        }
    })
}

const getAllChannels = async (userId: string) => {
    return await prisma.chatChannels.findMany({
        where: {
            members: {
                some: {
                    id: userId
                }
            }
        }
        , include: {
            members: true
        }
    })
}

const checkChannelMembership = async (userId: string, channelId: string) => {
    const channel = await prisma.chatChannels.findUnique({
        where: {
            id: channelId,
            members: {
                some: {
                    id: userId
                }
            }
        }
    })

    return !!channel
}

const checkParticipantPermission = async (userId: string, channelId: string) => {
    const channel = await prisma.chatChannels.findUnique({
        where: {
            id: channelId,
            moderators: {
                some: {
                    id: userId
                }
            }
        }
    })

    return !!channel
}

const updateChatChannelName = async (channelId: string, name: string) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: { name }
    })
}

const updateChatChannelAvatar = async (channelId: string, avatarUrl: string) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: { avatarUrl }
    })
}

const addMembersToChatChannel = async (channelId: string, memberIds: string[]) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: {
            members: {
                connect: memberIds.map(id => ({ id }))
            }
        }
    })
}

const removeMembersFromChatChannel = async (channelId: string, memberIds: string[]) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: {
            members: {
                disconnect: memberIds.map(id => ({ id }))
            }
        }
    })
}

const deleteChatChannel = async (channelId: string) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: { isDeleted: true }
    }
    )
}

const addModeratorsToChatChannel = async (channelId: string, moderatorIds: string[]) => {
    return await prisma.chatChannels.update({
        where: { id: channelId },
        data: {
            moderators: {
                connect: moderatorIds.map(id => ({ id }))
            }
        }
    })
}

const deleteMessage = async (messageId: string) => {
    return await prisma.chatMessages.update({
        where: { id: messageId },
        data: { isDeleted: true }
    })
}

const checkMessagePermission = async (userId: string, messageId: string) => {
    const message = await prisma.chatMessages.findUnique({
        where: {
            id: messageId,
            senderId: userId
        }
    })

    return !!message
}

export const chatRepository = {
    createDirectChatChannel,
    getOrCreateDirectChatChannel,
    createMessage,
    getChannelMessages,
    checkChannelMembership,
    getAllChannels,
    createMediaMessage,
    createChatChannel,
    updateChatChannelName,
    updateChatChannelAvatar,
    addMembersToChatChannel,
    removeMembersFromChatChannel,
    deleteChatChannel,
    addModeratorsToChatChannel,
    deleteMessage,
    checkParticipantPermission,
    checkMessagePermission
}