import { ChatMessageType } from "@prisma/client"
import { Server, Socket } from "socket.io"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const chatGateway = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("User connected to socket server")

        socket.on("join_channel", (data: { channelId: string }) => {
            const { channelId } = data;
            socket.join(channelId);
            console.log(`User joined channel ${channelId}`);
        });

        socket.on("send_message", async (payload: MessagePayload) => {
            try {
                const newMessage = await sendMessage(socket, payload);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected from socket server");
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
    console.log(newMessage.mediaUrls)

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
        mediaUrls: newMessage.mediaUrls
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
        mediaUrls: newMessage.mediaUrls
    });
    console.log("Message sent to channel", payload.channelId);
}