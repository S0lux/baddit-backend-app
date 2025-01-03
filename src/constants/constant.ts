export const enum HttpStatusCode {
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  CREATED = 201,
  CONFLICT = 409,
  BAD_REQUEST = 400,
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  INVALID_TOKEN = 498,
  INTERNAL_SERVER_ERROR = 500,
}

export const APP_ERROR_CODE = {
  serverError: { code: "SERVER_ERROR", message: "Something went wrong, try again later" },
  notLoggedIn: { code: "NOT_LOGGED_IN", message: "You are not logged in" },
  invalidCredentials: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" },
  unexpectedBody: { code: "UNEXPECTED_BODY", message: "Unexpected fields found in request body" },

  usernameTaken: {
    code: "USERNAME_TAKEN",
    message: "This username is already taken",
  },

  emailTaken: {
    code: "EMAIL_TAKEN",
    message: "This email is already taken",
  },

  emailNotVerified: {
    code: "EMAIL_NOT_VERIFIED",
    message: "You need to verify your email address",
  },

  tokenExpired: {
    code: "TOKEN_EXPIRED",
    message: "The token has expired",
  },

  tokenInvalid: {
    code: "TOKEN_INVALID",
    message: "The token is invalid",
  },

  userNotFound: {
    code: "USER_NOT_FOUND",
    message: "This user does not exist",
  },

  communityNameTaken: {
    code: "COMMUNITY_NAME_TAKEN",
    message: "This community name is already taken",
  },

  communityNotFound: {
    code: "COMMUNITY_NOT_FOUND",
    message: "This community does not exist",
  },

  communityMemberNotFound: {
    code: "COMMUNITY_MEMBER_NOT_FOUND",
    message: "User is not a member of this community",
  },

  onlyAcceptedForMember: {
    code: "ONLY_ACCEPT_FOR_MEMBER",
    message: "Can only create moderator for member",
  },

  userIsAlreadyModerator: {
    code: "USER_IS_ALREADY_MODERATOR",
    message: "User is already a moderator of this community",
  },

  userIsAlreadyAdmin: {
    code: "USER_IS_ALREADY_ADMIN",
    message: "User is already a admin of this community",
  },
  userIsAlreadyMember: {
    code: "USER_IS_ALREADY_MEMBER",
    message: "User is already a member of this community",
  },

  userAlreadyInCommunity: {
    code: "USER_ALREADY_IN_COMMUNITY",
    message: "User is already in this community",
  },

  userAlreadyOutCommunity: {
    code: "USER_ALREADY_Out_COMMUNITY",
    message: "User is already out this community",
  },

  missingMedia: {
    code: "MISSING_MEDIA",
    message: "Missing media in the request",
  },

  createPostFailed: {
    code: "CREATE_POST_FAILED",
    message: "Failed to create post",
  },

  createCommentFailed: {
    code: "CREATE_COMMENT_FAILED",
    message: "Failed to create comment",
  },

  onlyImageAllowed: {
    code: "ONLY_IMAGE_ALLOWED",
    message: "Only images are allowed",
  },

  onlyImageOrVideoAllowed: {
    code: "ONLY_IMAGE_AND_VIDEO_ALLOWED",
    message: "Only images and videos are allowed",
  },

  unknownVoteState: {
    code: "UNKNOWN_VOTE_STATE",
    message: "Vote state must be UPVOTE or DOWNVOTE",
  },

  postNotFound: {
    code: "POST_NOT_FOUND",
    message: "Post not found",
  },
  insufficientPermissions: {
    code: "INSUFFICIENT_PERMISSIONS",
    message: "You do not have permission to perform this action",
  },

  mediaPostEditingUnsupported: {
    code: "MEDIA_POST_EDITING_UNSUPPORTED",
    message: "Editing media posts is not supported",
  },

  wrongPassword: {
    code: "WRONG_PASSWORD",
    message: "Incorrect old password",
  },

  emailAlreadyVerified: {
    code: "EMAIL_ALREADY_VERIFIED",
    message: "Email is already verified",
  },

  notificationNotFound: {
    code: "NOTIFICATION_NOT_FOUND",
    message: "Notification not found",
  },

  invalidNotificationData: {
    code: "INVALID_NOTIFICATION_DATA",
    message: "Invalid notification data",
  },

  alreadyFriended: {
    code: "ALREADY_FRIENDED",
    message: "Users are already friends",
  },

  notFriended: {
    code: "NOT_FRIENDED",
    message: "Users are not friends",
  },

  blocked: {
    code: "BLOCKED",
    message: "User is blocked",
  },

  friendRequestAlreadySent: {
    code: "FRIEND_REQUEST_ALREADY_SENT",
    message: "Friend request already sent",
  },

  userSuspended: {
    code: "USER_SUSPENDED",
    message: "User is suspended",
  },
};
