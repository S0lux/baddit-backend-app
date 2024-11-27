import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { NotificationType, PrismaClient, User } from '@prisma/client';
import { Application } from 'express';
import passport from 'passport';
import session from 'express-session';

export class SocketGateway {
    private io: Server;
    private prisma: PrismaClient;

    constructor(app: Application, httpServer: HttpServer, prisma: PrismaClient) {
        // Configure CORS from your existing CORS configuration
        const { corsOptions } = require('./config/cors');
        const { sessionOptions } = require("./config/session");

        this.prisma = prisma;
        this.io = new Server(httpServer, {
            cors: {
                origin: corsOptions.origin,
                methods: ["GET", "POST"],
                credentials: corsOptions.credentials
            }
        });


        this.initializeSocketMiddleware(sessionOptions);
        this.initializeSocketEvents();
    }

    private initializeSocketMiddleware(sessionOptions: session.SessionOptions) {
        // Socket.IO authentication middleware
        this.io.use((socket: SocketUser, next) => {
            const req = socket.request as any;
            const res = {} as any;

            // Apply session middleware
            session(sessionOptions)(req, res, () => {
                // Initialize Passport
                passport.initialize()(req, res, () => {
                    passport.session()(req, res, () => {
                        // Attach authenticated user to socket
                        if (req.user) {
                            socket.user = req.user;
                            next();
                        } else {
                            next(new Error('Authentication required'));
                        }
                    });
                });
            });
        });
    }

    private initializeSocketEvents() {
        this.io.on('connection', async (socket: SocketUser) => {
            if (!socket.user) {
                socket.disconnect(true);
                return;
            }

            console.log(`Client connected: ${socket.user.id}`);

            // Join user-specific room
            socket.join(socket.user.id);

            // Define your socket event handlers here
            this.setupChatEvents(socket);
            this.setupNotificationEvents(socket);
            this.setupUserStatusEvents(socket);

            // Disconnect handling
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    private setupChatEvents(socket: SocketUser) {
        socket.on('send_chat_message', async (data) => {
            await this.handleChatMessage(socket, data);
        });

        socket.on('fetch_chat_history', async (data) => {
            await this.fetchChatHistory(socket, data);
        });
    }

    private setupNotificationEvents(socket: SocketUser) {
        socket.on('send_notification', async (data) => {
            await this.handleNotification(socket, data);
        });
    }

    private setupUserStatusEvents(socket: SocketUser) {
        socket.on('set_user_status', async (status) => {
            await this.handleUserStatus(socket, status);
        });
    }

    // Existing methods like handleChatMessage, handleNotification, etc. remain the same as in previous implementation

    private handleDisconnect(socket: SocketUser) {
        console.log(`Client disconnected: ${socket.user?.id}`);

        // Update user status to offline
        if (socket.user) {
            this.handleUserStatus(socket, 'OFFLINE').catch(console.error);
        }
    }

    private async handleNotification(socket: SocketUser, data: {
        recipientId: string,
        type: NotificationType,
        payload: any
    }) {
        try {
            if (!socket.user) {
                throw new Error('Not authenticated');
            }

            const notification = await this.prisma.notifications.create({
                data: {
                    type: data.type,
                    payload: data.payload,
                    targetUsers: {
                        connect: [{ id: data.recipientId }]
                    }
                }
            });

            // Emit to specific user's room
            this.io.to(data.recipientId).emit('new_notification', notification);
        } catch (error) {
            this.handleSocketError(socket, 'notification_error', error);
        }
    }

    private async handleChatMessage(socket: SocketUser, data: {
        channelId: string,
        content: string
    }) {
        try {
            if (!socket.user) {
                throw new Error('Not authenticated');
            }

            // Verify channel membership
            const channelMembership = await this.prisma.chatChannels.findUnique({
                where: {
                    id: data.channelId,
                    members: {
                        some: { id: socket.user.id }
                    }
                }
            });

            if (!channelMembership) {
                throw new Error('Not a member of this chat channel');
            }

            // Create message
            const message = await this.prisma.chatMessages.create({
                data: {
                    senderId: socket.user.id,
                    channelId: data.channelId,
                    content: data.content
                },
                include: { sender: true }
            });

            // Broadcast to channel members
            this.io.to(data.channelId).emit('receive_chat_message', {
                id: message.id,
                senderId: message.senderId,
                content: message.content,
                createdAt: message.createdAt.toISOString()
            });

            // Update channel read status
            await this.prisma.chatChannelReadStatus.upsert({
                where: {
                    userId_channelId: {
                        userId: socket.user.id,
                        channelId: data.channelId
                    }
                },
                update: { lastReadMessageId: message.id },
                create: {
                    userId: socket.user.id,
                    channelId: data.channelId,
                    lastReadMessageId: message.id
                }
            });

        } catch (error) {
            this.handleSocketError(socket, 'chat_error', error);
        }
    }

    private async fetchChatHistory(socket: SocketUser, data: {
        channelId: string,
        limit?: number
    }) {
        try {
            if (!socket.user) {
                throw new Error('Not authenticated');
            }

            // Verify channel membership
            const channelMembership = await this.prisma.chatChannels.findUnique({
                where: {
                    id: data.channelId,
                    members: {
                        some: { id: socket.user.id }
                    }
                }
            });

            if (!channelMembership) {
                throw new Error('Not a member of this chat channel');
            }

            const messages = await this.prisma.chatMessages.findMany({
                where: { channelId: data.channelId },
                orderBy: { createdAt: 'desc' },
                take: data.limit || 50,
                include: { sender: true }
            });

            socket.emit('chat_history', messages.reverse());
        } catch (error) {
            this.handleSocketError(socket, 'chat_history_error', error);
        }
    }

    private async handleFriendRequest(socket: SocketUser, data: {
        receiverId: string
    }) {
        try {
            if (!socket.user) {
                throw new Error('Not authenticated');
            }

            const friendRequest = await this.prisma.friendRequests.create({
                data: {
                    senderId: socket.user.id,
                    receiverId: data.receiverId,
                    status: 'PENDING'
                },
                include: {
                    sender: true,
                    receiver: true
                }
            });

            // Emit to receiver
            this.io.to(data.receiverId).emit('new_friend_request', friendRequest);

            // Create notification
            await this.prisma.notifications.create({
                data: {
                    type: 'FRIEND_REQUEST',
                    payload: { friendRequestId: friendRequest.id },
                    targetUsers: {
                        connect: [{ id: data.receiverId }]
                    }
                }
            });

            socket.emit('friend_request_sent', friendRequest);
        } catch (error) {
            this.handleSocketError(socket, 'friend_request_error', error);
        }
    }

    private async handleUserStatus(socket: SocketUser, status: 'ONLINE' | 'OFFLINE') {
        try {
            if (!socket.user) return;

            // Update user status
            await this.prisma.user.update({
                where: { id: socket.user.id },
                data: { status: status === 'ONLINE' ? 'STANDARD' : 'SUSPENDED' }
            });

            // Broadcast status change
            this.io.emit('user_status_change', {
                userId: socket.user.id,
                status: status
            });
        } catch (error) {
            console.error('User status update error:', error);
        }
    }

    // Centralized error handling for socket events
    private handleSocketError(socket: SocketUser, eventName: string, error: any) {
        console.error(`${eventName} error:`, error);
        socket.emit(eventName, {
            message: error.message || 'An unexpected error occurred',
            code: error.code || 'UNKNOWN_ERROR'
        });
    }

    // Expose IO instance for advanced use cases
    getIO() {
        return this.io;
    }

    // Method to broadcast to all connected clients
    broadcastToAll(event: string, data: any) {
        this.io.emit(event, data);
    }

    // Method to send to a specific user
    sendToUser(userId: string, event: string, data: any) {
        this.io.to(userId).emit(event, data);
    }
}

// Socket User type extension
interface SocketUser extends Socket {
    user?: User;
}

// Export initialization function
export const initializeSocketGateway = (
    app: Application,
    httpServer: HttpServer,
    prisma: PrismaClient
) => {
    return new SocketGateway(app, httpServer, prisma);
};