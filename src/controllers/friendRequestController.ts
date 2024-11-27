// friendRequestController.ts

import { NextFunction, Request, Response } from "express";
import friendRequestService from "../services/friendRequestService";

const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { senderId, receiverId } = req.body
        const request = await friendRequestService.sendFriendRequest(senderId, receiverId)
        res.status(201).json(request)
    } catch (error) {
        next(error)
    }
}

const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId, receiverId } = req.body
        const request = await friendRequestService.acceptFriendRequest(requestId, receiverId)
        res.status(200).json(request)
    } catch (error) {
        next(error)
    }
}

const rejectFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.body
        const request = await friendRequestService.rejectFriendRequest(requestId)
        res.status(200).json(request)
    } catch (error) {
        next(error)
    }
}

const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId
        const type = req.query.type as 'sent' | 'received'
        const requests = await friendRequestService.getFriendRequests(userId, type)
        res.status(200).json(requests)
    } catch (error) {
        next(error)
    }
}

const getFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId
        const friends = await friendRequestService.getFriends(userId)
        res.status(200).json(friends)
    } catch (error) {
        next(error)
    }
}

const removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, friendId } = req.body
        await friendRequestService.removeFriend(userId, friendId)
        res.status(200).json({ message: 'Friend removed successfully' })
    } catch (error) {
        next(error)
    }
}

export const friendRequestController = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends,
    removeFriend
}