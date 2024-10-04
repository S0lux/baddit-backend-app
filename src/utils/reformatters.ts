import { Prisma } from "@prisma/client";

type Posts = Prisma.PostGetPayload<{
  include: { community: true; author: true; vote: true; _count: { select: { comments: true } } };
}>;

type UserCommunities = Prisma.User_CommunityGetPayload<{
  include: { community: true };
}>;

type Users = Prisma.UserGetPayload<{}>;

function reformatPosts(posts: Posts[]) {
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    mediaUrls: post.mediaUrls,
    score: post.score,
    voteState: post.vote[0]?.state || null,
    commentCount: post._count.comments,
    author: {
      id: post.authorId,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    },
    community: {
      name: post.communityName,
      logoUrl: post.community?.logoUrl,
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));

  return formattedPosts;
}

function reformatUserCommunities(userCommunities: UserCommunities[]) {
  const formattedUserCommunities = userCommunities.map((data) => ({
    id: data.communityId,
    name: data.community.name,
    role: data.communityRole,
    banned: data.banned,
  }));

  return formattedUserCommunities;
}

function reformatUsers(user: Users) {
  const formattedUsers = {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    registeredAt: user.registeredAt,
  };
  return formattedUsers;
}

function reformatComments(comments: any) {
  // Helper function to transform a single comment
  function transformComment(comment: any) {
    // Set voteState based on CommentVote array
    comment.voteState = comment.CommentVote.length > 0 ? comment.CommentVote[0].state : null;
    // Remove the original CommentVote array
    delete comment.CommentVote;

    // Recursively transform children comments if they exist
    if (comment.children && comment.children.length > 0) {
      comment.children = comment.children.map(transformComment);
    }

    return comment;
  }

  // Transform all top-level comments
  return comments.map(transformComment);
}

export const reformatters = {
  reformatPosts,
  reformatUserCommunities,
  reformatUsers,
  reformatComments,
};
