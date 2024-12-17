import express, { Request, Response } from "express";
import { notificationController } from "../controllers/notificationController";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";
import notificationService from "../services/notificationService";
const router = express.Router();

router.get("/test", async (req: Request, res: Response) => {
  await notificationService.createNotification(
    ["27fc5a3a-be5a-436d-8a97-ca6261231837"],
    "NEW_COMMENT",
    { title: "New reply", body: "Hello world!", typeId: "123" },
    { title: "New reply", body: "Someone just replied to one of the posts you are subscribed to!" }
  );

  return res.status(200).json({ message: "Pushed" });
});

router.use(ensureAuthenticated);

router.get("/", notificationController.getNotificationsForUser);
router.get("/:notificationId/mark-as-read", notificationController.markNotificationAsRead);
router.post("/fcm", notificationController.createOrUpdateFcmToken);

export default router;
