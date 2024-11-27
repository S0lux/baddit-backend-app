import { NextFunction, Request, Response } from "express";

const sendMessage = (req: Request, res: Response, next: NextFunction) => { }

const getChannelMessages = (req: Request, res: Response, next: NextFunction) => { }

export const chatController = {
    sendMessage,
    getChannelMessages
}
