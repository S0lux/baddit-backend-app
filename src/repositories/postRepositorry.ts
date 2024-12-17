import { PostType, Prisma, PrismaClient, VoteState } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { sub } from "date-fns";
import { get } from "http";

const prisma = new PrismaClient();

const createPost = async (data: {
  type: PostType;
  title: string;
  content: string;
  authorId: string;
  communityName?: string;
  mediaUrls?: string[];
}) => {
  return await prisma.post.create({
    data: {
      type: data.type,
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      communityName: data.communityName,
      mediaUrls: data.mediaUrls,
      subscribers: {
        connect: { id: data.authorId },
      },
    },
  });
};

const getPostsWithQueries = async (queries: {
  requesterId?: string;
  authorName?: string;
  postId?: string;
  communityName?: string;
  cursor?: string;
  postTitle?: string;
  orderByScore?: string;
}) => {
  const posts = await prisma.post.findMany({
    where: {
      author: { username: queries.authorName },
      id: queries.postId,
      community: { name: queries.communityName },
      title: queries.postTitle,
      deleted: false,
    },
    take: 10,
    skip: queries.cursor ? 1 : 0,
    cursor: queries.cursor ? { id: queries.cursor } : undefined,
    orderBy: queries.orderByScore ? { score: "desc" } : { createdAt: "desc" },
    include: {
      vote: {
        where: queries.requesterId
          ? { user: { id: queries.requesterId } }
          : { user: { id: "dummy-id" } },
      },
      author: true,
      community: true,
      subscribers: queries.requesterId
        ? {
          where: {
            id: queries.requesterId,
          },
        }
        : false,
      _count: { select: { comments: true } },
    },
  });

  return posts.map((post) => ({
    ...post,
    isSubscribed: post.subscribers && post.subscribers.length > 0,
  }));
};

const overrideVoteState = async (
  state: VoteState,
  userId: string,
  postId: string,
  tx?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) => {
  const db = tx || prisma;

  return db.postVote.upsert({
    where: { userId_postId: { postId, userId } },
    update: { state },
    create: { state, userId, postId },
  });
};

const deleteVoteState = async (
  userId: string,
  postId: string,
  tx?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) => {
  const db = tx || prisma;
  return await db.postVote.delete({
    where: { userId_postId: { postId, userId } },
  });
};

const findUserVoteState = async (userId: string, postId: string) => {
  return await prisma.postVote.findUnique({
    where: { userId_postId: { postId, userId } },
  });
};

const updatePostScoreBy = async (
  postId: string,
  value: number,
  tx?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) => {
  const db = tx || prisma;
  return await db.post.update({
    where: { id: postId },
    data: {
      score: {
        increment: value,
      },
    },
  });
};

const deletePost = async (postId: string) => {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      deleted: true,
      updatedAt: new Date(),
    },
  });
};

const deleteAllPostsInCommunity = async (communityName: string) => {
  return await prisma.post.updateMany({
    where: { communityName: communityName },
    data: { deleted: true, updatedAt: new Date() },
  });
};

const editTextPostContent = async (postId: string, content: string) => {
  return await prisma.post.update({
    where: { id: postId },
    data: { content, updatedAt: new Date() },
  });
};

const subscribeToPost = async (postId: string, userId: string) => {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      subscribers: {
        connect: { id: userId },
      },
    },
  });
};

const unsubscribeFromPost = async (postId: string, userId: string) => {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      subscribers: {
        disconnect: { id: userId },
      },
    },
  });
};

const getPostSubscriberIds = async (postId: string) => {
  const subscribers = await prisma.post.findUnique({
    where: { id: postId },
    select: { subscribers: { select: { id: true } } },
  });

  return subscribers?.subscribers.map((subscriber) => subscriber.id);
};

export const postRepository = {
  createPost,
  getPostsWithQueries,
  deleteVoteState,
  findUserVoteState,
  updatePostScoreBy,
  overrideVoteState,
  deletePost,
  deleteAllPostsInCommunity,
  editTextPostContent,
  subscribeToPost,
  unsubscribeFromPost,
  getPostSubscriberIds,
};
