import express from "express";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";
import { notificationController } from "../controllers/notificationController";
const router = express.Router();

router.use(ensureAuthenticated);

router.get("/", notificationController.getNotificationsForUser);
router.post("/fcm", notificationController.createOrUpdateFcmToken);
router.post("/:notificationId/mark-as-read", notificationController.markNotificationAsRead);

export default router;
