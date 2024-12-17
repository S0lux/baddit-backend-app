import express from "express";
import { friendController } from "../controllers/friendController";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";

const router = express.Router();

router.get("/:userId", friendController.getFriends);

router.use(ensureAuthenticated);

router.post("/:userId/send", friendController.sendFriendRequest);
router.post("/:userId/cancel", friendController.cancelFriendRequest);
router.post("/:userId/accept", friendController.acceptFriendRequest);
router.post("/:userId/reject", friendController.rejectFriendRequest);
router.post("/:userId/remove", friendController.removeFriend);

export default router;
