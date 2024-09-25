import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { commentBodyValidator } from "../validators/schemas/commentBody";
import commentService from "../services/commentService";
import { postRepository } from "../repositories/postRepositorry";
import communityService from "../services/communityService";
import { voteCommentBodyValidator } from "../validators/schemas/voteCommentBody";

const createComment = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { content, postId, parentId }: z.infer<typeof commentBodyValidator> = req.body;
  try {
    await commentService.createComment(
      content,
      userId,
      postId as string | undefined,
      parentId as string | undefined
    );
    res.status(201).json({ message: "Comment created successfully" });
  } catch (err) {
    next(err);
  }
};

const getCommentsWithQueries = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.query.postId as string | undefined;
  const commentId = req.query.commentId as string | undefined;
  const authorId = req.query.authorId as string | undefined;
  const requesterId = req.user?.id;
  const cursor = req.query.cursor as string | undefined;
  try {
    const comments = await commentService.getCommentsWithQueries({
      postId,
      commentId,
      requesterId,
      authorId,
      cursor,
    });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = req.params["commentId"];
  const user = req.user!;

  try {
    const comment = await commentService.getCommentsWithQueries({ commentId });
    const postId = comment[0].postId as string | undefined;
    const post = await postRepository.getPostsWithQueries({ postId });
    const community = await communityService.getCommunityByName(post[0].communityName);
    const userCommunityRole = await communityService.getUserCommunityRole(user.id, community.id);

    await commentService.deleteComment(commentId, comment, user, userCommunityRole);

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

const voteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user!;

    const { commentId, state }: z.infer<typeof voteCommentBodyValidator> = {
      commentId: req.params["commentId"],
      state: req.body.state,
    };

    const comment = await commentService.getCommentsWithQueries({ commentId, requesterId: id });
    await commentService.overrideVoteState(id, comment[0], state);
    res.status(200).json({ message: "Vote state updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const removeVote = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user!;
  const commentId = req.body["commentId"];

  try {
    const comment = await commentService.getCommentsWithQueries({ commentId, requesterId: id });
    await commentService.overrideVoteState(id, comment[0]);
    res.status(200).json({ message: "Vote state removed" });
  } catch (err) {
    next(err);
  }
};

const editTextPostContent = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = req.params["commentId"];
  const content = req.body.content;
  const user = req.user!;

  try {
    const comment = await commentService.getCommentsWithQueries({ commentId });
    await commentService.editTextCommentContent(comment[0], content, user);

    res.status(200).json({ message: "Comment content updated" });
  } catch (err) {
    next(err);
  }
};
export const commentController = {
  createComment,
  getCommentsWithQueries,
  deleteComment,
  voteComment,
  removeVote,
  editTextPostContent,
};
