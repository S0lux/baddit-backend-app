import { NextFunction, Request, Response } from "express";
import reportService from "../services/reportService";
import { UserRole } from "@prisma/client";

const createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, content, reportedUserId, reportedPostId } = req.body;
        const reporterId = req.user!.id;
        const report = await reportService.createReport({
            type,
            content,
            reporterId,
            reportedUserId,
            reportedPostId
        });
        res.status(201).json(report);
    }
    catch (error) {
        next(error);
    }
}

const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.json(await reportService.getAllReports());
    }
    catch (error) {
        next(error);
    }
}

const resolveReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const resolvedById = req.user!.id;
        const adminRole = req.user!.role as UserRole;
        const report = await reportService.resolveReport({
            id,
            status: "RESOLVED",
            resolvedById,
            adminRole
        });
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}

export const reportController = {
    createReport,
    getAllReports,
    resolveReport
}