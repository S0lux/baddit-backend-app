import express from "express";
import { bannerParser, logoParser } from "../middlewares/multerParsers";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";
import { friendRequestController } from "../controllers/friendRequestController";

const router = express.Router();

router.use(ensureAuthenticated);
router.post('/request', friendRequestController.sendFriendRequest)
router.post('/accept', friendRequestController.acceptFriendRequest)
router.post('/reject', friendRequestController.rejectFriendRequest)
router.get('/:userId/requests', friendRequestController.getFriendRequests)
router.get('/:userId/friends', friendRequestController.getFriends)
router.delete('/remove', friendRequestController.removeFriend)

export default router