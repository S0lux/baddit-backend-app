import express from "express";
import { bannerParser, logoParser } from "../middlewares/multerParsers";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";
import { chatController } from "../controllers/chatController";

const router = express.Router();

router.use(ensureAuthenticated);
router.get('/:channelId', chatController.getChannelMessages)
router.post('/:channelId', chatController.sendMessage)

export default router