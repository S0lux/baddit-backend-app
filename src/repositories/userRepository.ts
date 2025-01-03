import { FriendRequestStatus, PrismaClient, UserRelation } from "@prisma/client";

const prisma = new PrismaClient();

const createUser = async (data: { username: string; hashedPassword: string; email: string }) => {
  return await prisma.user.create({
    data: { ...data, avatarUrl: `https://api.dicebear.com/9.x/initials/png?seed=${data.username}` },
  });
};

const getUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({ where: { username } });
};

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

const getUserByToken = async (token: string) => {
  return prisma.emailToken.findFirst({
    where: { token },
    include: { User: true },
  });
};

const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { emailTokens: true },
  });
};

const updateAvatar = async (id: string, avatar: string) => {
  return await prisma.user.update({
    where: { id },
    data: { avatarUrl: avatar },
  });
};

const getEmailTokens = async (userId: string) => {
  return await prisma.emailToken.findMany({
    where: { userId },
  });
};

const updateEmailVerified = async (id: string) => {
  return await prisma.user.update({
    where: { id },
    data: { emailVerified: true },
  });
};

const addEmailToken = async (userId: string, token: string, expireAt: Date) => {
  return await prisma.emailToken.create({
    data: { token, expireAt, userId },
  });
};

const deleteEmailToken = async (token: string) => {
  return await prisma.emailToken.delete({
    where: { token },
  });
};

const updatePassword = async (userId: string, newPassword: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword: newPassword },
  });
};

const banUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });
};

export const userRepository = {
  createUser,
  getUserByUsername,
  getUserById,
  getUserByEmail,
  getUserByToken,
  updateAvatar,
  deleteEmailToken,
  addEmailToken,
  getEmailTokens,
  updateEmailVerified,
  updatePassword,
  banUser,
};
