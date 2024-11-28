import { PrismaClient } from "@prisma/client";
import { HttpException } from "../exception/httpError";
import { APP_ERROR_CODE } from "../constants/constant";

const prisma = new PrismaClient();

const getUsersRelation = async (userId: string, otherId: string) => {
  const relation = await prisma.userRelations.findFirst({
    where: {
      OR: [
        { userId: userId, targetUserId: otherId },
        { userId: otherId, targetUserId: userId },
      ],
    },
  });

  if (!relation) return undefined;
  return relation.relation;
};

const getUserFriends = async (userId: string) => {
  const userFriends = await prisma.userRelations.findMany({
    where: {
      relation: "FRIEND",
      OR: [{ userId: userId }, { targetUserId: userId }],
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          status: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          status: true,
        },
      },
    },
  });

  // Transform the result to return only the friend's profile
  return userFriends.map((relation) =>
    relation.user.id === userId ? relation.targetUser : relation.user
  );
};

const getIncomingRequestsForUser = async (userId: string) => {
  const result = await prisma.friendRequests.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          status: true,
        },
      },
    },
  });
  return result;
};

const getOutgoingRequestsForUser = async (userId: string) => {
  return await prisma.friendRequests.findMany({
    where: {
      senderId: userId,
      status: "PENDING",
    },
    include: {
      receiver: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          status: true,
        },
      },
    },
  });
};

const createFriendRequest = async (requesterUserId: string, targetUserId: string) => {
  const existingRequest = await prisma.friendRequests.findFirst({
    where: {
      senderId: requesterUserId,
      receiverId: targetUserId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingRequest) throw new HttpException(400, APP_ERROR_CODE.friendRequestAlreadySent);

  return await prisma.friendRequests.create({
    data: {
      senderId: requesterUserId,
      receiverId: targetUserId,
    },
  });
};

const cancelFriendRequest = async (requesterUserId: string, targetUserId: string) => {
  return await prisma.friendRequests.deleteMany({
    where: {
      senderId: requesterUserId,
      receiverId: targetUserId,
      status: "PENDING",
    },
  });
};

const acceptFriendRequest = async (requesterUserId: string, targetUserId: string) => {
  const existingRequest = await prisma.friendRequests.findFirst({
    where: {
      senderId: requesterUserId,
      receiverId: targetUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!existingRequest) throw new Error("No existing matching request found");
  if (existingRequest.status != "PENDING")
    throw new Error("This request has already been replied to.");

  // Add user to friend list
  await prisma.userRelations.create({
    data: {
      userId: requesterUserId,
      targetUserId: targetUserId,
      relation: "FRIEND",
    },
  });

  // Update existing request
  await prisma.friendRequests.update({
    where: { id: existingRequest.id },
    data: { status: "ACCEPTED" },
  });
};

const rejectFriendRequest = async (requesterUserId: string, targetUserId: string) => {
  const existingRequest = await prisma.friendRequests.findFirst({
    where: {
      senderId: requesterUserId,
      receiverId: targetUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!existingRequest) throw new Error("No existing matching request found");
  if (existingRequest.status != "PENDING")
    throw new Error("This request has already been replied to.");

  // Update existing request
  await prisma.friendRequests.update({
    where: { id: existingRequest.id },
    data: { status: "REJECTED" },
  });
};

const removeFriendRelation = async (userId: string, otherUserId: string) => {
  await prisma.userRelations.deleteMany({
    where: {
      relation: "FRIEND",
      OR: [
        { userId: userId, targetUserId: otherUserId },
        { userId: otherUserId, targetUserId: userId },
      ],
    },
  });
};

export const friendRepository = {
  getUsersRelation,
  getUserFriends,
  getIncomingRequestsForUser,
  getOutgoingRequestsForUser,
  createFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendRelation,
};
