import { ReportStatus, ReportType, UserRole } from "@prisma/client";
import { HttpException } from "../exception/httpError";
import { HttpStatusCode } from "../constants/constant";
import { reportRepository } from "../repositories/reportRepository";
import { userRepository } from "../repositories/userRepository";
import { postRepository } from "../repositories/postRepositorry";
import notificationService from "./notificationService";

class ReportService {
  async createReport(data: {
    type: ReportType;
    content: string;
    reporterId: string;
    reportedUserId?: string;
    reportedPostId?: string;
  }) {
    if (data.type === "USER" && !data.reportedUserId) {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "ERR_REPORTED_USER_ID_REQUIRED",
        message: "Reported user id is required",
      });
    }

    if (data.type === "POST" && !data.reportedPostId) {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "ERR_REPORTED_POST_ID_REQUIRED",
        message: "Reported post id is required",
      });
    }

    if (data.type === "USER" && data.reporterId === data.reportedUserId) {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "ERR_CANNOT_REPORT_YOURSELF",
        message: "You cannot report yourself",
      });
    }

    try {
      return reportRepository.createReport(data);
    } catch (error) {
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
        code: "ERR_INTERNAL_SERVER",
        message: "Internal server error",
      });
    }
  }

  async getAllReports() {
    try {
      return reportRepository.findAllReport();
    } catch (error) {
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
        code: "ERR_INTERNAL_SERVER",
        message: "Internal server error",
      });
    }
  }

  async resolveReport(data: {
    id: string;
    status: ReportStatus;
    resolvedById: string;
    adminRole: UserRole;
  }) {
    if (data.adminRole !== "ADMIN") {
      throw new HttpException(HttpStatusCode.FORBIDDEN, {
        code: "ERR_FORBIDDEN",
        message: "You are not allowed to resolve report",
      });
    }

    const report = await reportRepository.findById(data.id);
    if (!report) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, {
        code: "ERR_REPORT_NOT_FOUND",
        message: "Report not found",
      });
    }

    if (report.status !== "PENDING") {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "ERR_REPORT_ALREADY_RESOLVED",
        message: "Report already resolved",
      });
    }

    try {
      if (report.type === "USER") {
        await userRepository.banUser(report.reportedUserId!);

        await notificationService.createNotification(
          [report.reportedUserId!],
          "ACCOUNT_SUSPENDED",
          {
            type: "ACCOUNT_SUSPENDED",
            title: "Account suspended",
            body: `Your account has been suspended due to multiple reports`,
          },
          {
            title: "Account suspended",
            body: `Your account has been suspended due to multiple reports`,
            clickAction: "ACCOUNT_SUSPENDED",
          }
        );
      }
      if (report.type === "POST") {
        await postRepository.deletePost(report.reportedPostId!);
      }

      return reportRepository.updateReportStatus(data);
    } catch (error) {
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
        code: "ERR_INTERNAL_SERVER",
        message: "Internal server error",
      });
    }
  }
}

export default new ReportService();
