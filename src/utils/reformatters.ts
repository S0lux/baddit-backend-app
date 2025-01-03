import { Prisma } from "@prisma/client";

type Posts = Prisma.PostGetPayload<{
  include: { community: true; author: true; vote: true; _count: { select: { comments: true } } };
}>;

type UserCommunities = Prisma.UserCommunityGetPayload<{
  include: { community: true };
}>;

type Users = Prisma.UserGetPayload<{}>;

type Members = Prisma.UserCommunityGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        avatarUrl: true;
      };
    };
  };
}>;

function reformatPosts(posts: (Posts & { isSubscribed: boolean })[]) {
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    mediaUrls: post.mediaUrls,
    score: post.score,
    voteState: post.vote[0]?.state || null,
    commentCount: post._count.comments,
    isSubscribed: post.isSubscribed,
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
    logoUrl: data.community.logoUrl,
    role: data.communityRole,
    banned: data.banned,
  }));

  return formattedUserCommunities;
}

function reformatOtherUsers(user: { targetUser: Prisma.UserGetPayload<{}>; isFriend: boolean }) {
  const formattedUsers = {
    ...user.targetUser,
    isFriend: user.isFriend,
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

    comment.community =
      comment.post?.community != null
        ? {
          id: comment.post.community.id,
          name: comment.post.community.name,
          logoUrl: comment.post.community.logoUrl,
        }
        : null;

    delete comment.post;

    // Recursively transform children comments if they exist
    if (comment.children && comment.children.length > 0) {
      comment.children = comment.children.map(transformComment);
    } else {
      comment.children = [];
    }

    return comment;
  }

  // Transform all top-level comments
  return comments.map(transformComment);
}

function reformatMembers(members: Members[]) {
  const formattedMembers = members.map((data) => ({
    userId: data.userId,
    username: data.user.username,
    avatarUrl: data.user.avatarUrl,
    communityRole: data.communityRole,
    joined: data.joined,
    banned: data.banned,
  }));
  return formattedMembers;
}

export const reformatters = {
  reformatPosts,
  reformatUserCommunities,
  reformatOtherUsers,
  reformatComments,
  reformatMembers,
};
