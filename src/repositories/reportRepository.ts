import { PrismaClient, ReportStatus, ReportType } from "@prisma/client";

const prisma = new PrismaClient();

const createReport = async (data: {
    type: ReportType;
    content: string;
    reporterId: string;
    reportedUserId?: string;
    reportedPostId?: string;
}) => {
    return prisma.report.create({
        data: {
            ...data,
            status: 'PENDING'
        }
    });
}

const findAllReport = async () => {
    return prisma.report.findMany({
        include: {
            reporter: true,
            reportedPost: true,
            reportedUser: true,
            resolvedBy: true
        }
    });
}

const updateReportStatus = async (data: {
    id: string;
    status: ReportStatus;
    resolvedById: string;
}) => {
    return prisma.report.update({
        where: {
            id: data.id
        },
        data: {
            status: data.status,
            resolvedById: data.resolvedById,
        }
    });
}

const findById = async (id: string) => {
    return prisma.report.findUnique({
        where: {
            id
        }
    });
}

export const reportRepository = {
    createReport,
    findAllReport,
    updateReportStatus,
    findById
}