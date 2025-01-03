import { CommunityRole, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createCommunity = async (data: { name: string; description: string; ownerId: string }) => {
  return await prisma.community.create({ data }).catch((error) => null);
};

const getCommunityByName = async (name: string) => {
  return await prisma.community.findUnique({ where: { name: name, deleted: false } });
};

const moderateMember = async (username: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: { user: { username }, communityId: communityId },
    data: { communityRole: CommunityRole.MODERATOR },
  });
};

const unModerateMember = async (username: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: { user: { username }, communityId: communityId },
    data: { communityRole: CommunityRole.MEMBER },
  });
};

const createCommunityAdmin = async (
  userId: string,
  communityId: string,
  communityRole: CommunityRole = CommunityRole.ADMIN
) => {
  const data = {
    userId: userId,
    communityId: communityId,
    communityRole: communityRole,
    joined: true,
  };
  return await prisma.userCommunity.create({ data }).catch((err) => console.log(err));
};

const createCommunityMember = async (data: { communityId: string; userId: string }) => {
  return await prisma.userCommunity
    .create({
      data: {
        userId: data.userId,
        communityId: data.communityId,
        joined: true,
      },
    })
    .catch((err) => null);
};

const getJoined = async (communityName: string) => {
  return await prisma.userCommunity.findMany({
    where: {
      community: { name: communityName },
      joined: true,
      banned: false,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
};

const getModerators = async (communityName: string) => {
  return await prisma.userCommunity.findMany({
    where: {
      community: { name: communityName },
      banned: false,
      communityRole: CommunityRole.MODERATOR,
      joined: true,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
};

const getUserCommunityRole = async (userId: string, communityId: string) => {
  return await prisma.userCommunity.findFirst({
    where: { userId: userId, communityId: communityId },
  });
};

const getUserInCommunity = async (username: string, communityId: string) => {
  return await prisma.userCommunity.findFirst({
    where: {
      user: { username: username },
      communityId: communityId,
    },
  });
};

const banUserInCommunity = async (userId: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: {
      userId: userId,
      communityId: communityId,
    },
    data: {
      banned: true,
    },
  });
};

const unBanUserInCommunity = async (userId: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: {
      userId: userId,
      communityId: communityId,
    },
    data: {
      banned: false,
    },
  });
};

const getCommunitiesWithQueries = async (queries: {
  name?: string;
  userId?: string;
  cursor?: string;
}) => {
  const communities = await prisma.community.findMany({
    take: 10,
    skip: queries.cursor ? 1 : 0,
    cursor: queries.cursor ? { id: queries.cursor } : undefined,
    where: {
      name: {
        startsWith: queries.name,
      },
      deleted: false,
    },
    orderBy: {
      memberCount: "desc",
    },
  });

  return communities;
};

const getAllCommunitiesJoined = async (queries: { userId: string }) => {
  return await prisma.userCommunity.findMany({
    where: {
      userId: queries.userId,
      joined: true,
      banned: false,
      deleted: false,
      community: { deleted: false },
    },
    include: {
      community: true,
    },
  });
};

const deleteCommunity = async (communityName: string) => {
  return await prisma.community.update({
    where: { name: communityName },
    data: { deleted: true, updateAt: new Date() },
  });
};

const unJoinCommunity = async (username: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: {
      user: { username },
      communityId: communityId,
    },
    data: {
      joined: false,
    },
  });
};

const joinCommunity = async (username: string, communityId: string) => {
  return await prisma.userCommunity.updateMany({
    where: {
      user: { username: username },
      communityId: communityId,
    },
    data: {
      joined: true,
    },
  });
};

const updateCommunityMemberCount = async (communityName: string, memberCount: number) => {
  return await prisma.community.update({
    where: { name: communityName },
    data: { memberCount: memberCount, updateAt: new Date() },
  });
};

const updateLogo = async (name: string, logo: string) => {
  return await prisma.community.update({
    where: { name: name },
    data: { logoUrl: logo },
  });
};

const updateBanner = async (name: string, banner: string) => {
  return await prisma.community.update({
    where: { name: name },
    data: { bannerUrl: banner },
  });
};

export const communityRepository = {
  createCommunity,
  moderateMember,
  createCommunityMember,
  createCommunityAdmin,
  getCommunityByName,
  getCommunitiesWithQueries,
  getUserCommunityRole,
  getUserInCommunity,
  getAllCommunitiesJoined,
  getJoined,
  getModerators,
  deleteCommunity,
  updateCommunityMemberCount,
  unJoinCommunity,
  unModerateMember,
  joinCommunity,
  updateLogo,
  updateBanner,
  banUserInCommunity,
  unBanUserInCommunity,
};
