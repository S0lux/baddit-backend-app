import { ChatMessageType } from "@prisma/client"
import { Server, Socket } from "socket.io"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const chatGateway = (io: Server) => {
    io.on("connection", (socket: Socket) => {

        socket.on("join_channel", (data: { channelId: string }) => {
            const { channelId } = data;
            socket.join(channelId);
        });

        socket.on("send_message", async (payload: MessagePayload) => {
            console.log("send_message", payload);
            try {
                const newMessage = await sendMessage(socket, payload);
            } catch (error) {
            }
        });

        socket.on("delete_message", async (payload: deleteMessagePayload) => {
            console.log("delete_message", payload);
            try {
                await deleteMessage(socket, payload);
            } catch (error) {
            }
        });

        socket.on("disconnect", () => {
        });
    });
}


type Sender = {
    id: string,
    username: string,
    avatarUrl: string,
}

type MessagePayload = {
    channelId: string,
    sender: Sender,
    content: string,
    mediaUrls: string[],
}

type deleteMessagePayload = {
    channelId: string,
    messageId: string,
}

async function deleteMessage(socket: Socket, payload: deleteMessagePayload) {
    const deletedMessage = await prisma.chatMessages.update({
        where: {
            id: payload.messageId,
            channelId: payload.channelId
        },
        data: {
            isDeleted: true
        }
    });

    socket.to(payload.channelId).emit("delete_message", {
        messageId: deletedMessage.id,
        channelId: deletedMessage.channelId
    });
    socket.emit("delete_message", {
        messageId: deletedMessage.id,
        channelId: deletedMessage.channelId
    });
}

async function sendMessage(socket: Socket, payload: MessagePayload) {
    const newMessage = await prisma.chatMessages.create({
        data: {
            senderId: payload.sender.id,
            channelId: payload.channelId,
            content: payload.content,
            mediaUrls: payload.mediaUrls,
            createdAt: new Date()
        },
        include: {
            sender: true
        }
    });

    socket.to(payload.channelId).emit("new_message", {
        id: newMessage.id,
        sender: {
            id: newMessage.sender.id,
            username: newMessage.sender.username,
            avatarUrl: newMessage.sender.avatarUrl
        },
        content: newMessage.content,
        createdAt: newMessage.createdAt.toISOString(),
        type: newMessage.type,
        mediaUrls: newMessage.mediaUrls,
        isDeleted: newMessage.isDeleted,
        channelId: newMessage.channelId,
    });
    socket.emit("new_message", {
        id: newMessage.id,
        sender: {
            id: newMessage.sender.id,
            username: newMessage.sender.username,
            avatarUrl: newMessage.sender.avatarUrl
        },
        content: newMessage.content,
        createdAt: newMessage.createdAt.toISOString(),
        type: newMessage.type,
        mediaUrls: newMessage.mediaUrls,
        channelId: newMessage.channelId,
    });
}