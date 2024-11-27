import { CommunityRole, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const createDirectChatChannel = async (userId1: string, userId2: string) => {
    return prisma.chatChannels.create({
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

const createMessage = async (senderId: string, channelId: string, content: string) => {
    return prisma.chatMessages.create({
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

const getChannelMessages = async (channelId: string, limit: number, offset: number) => {
    return prisma.chatMessages.findMany({
        where: { channelId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
            sender: true
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


export const chatRepository = {
    createDirectChatChannel,
    createMessage,
    getChannelMessages,
    checkChannelMembership
}