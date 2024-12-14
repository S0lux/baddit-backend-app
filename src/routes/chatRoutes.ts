import express from "express";
import { chatChannelAvatarParser, chatMediaParser } from "../middlewares/multerParsers";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";
import { chatController } from "../controllers/chatController";

const router = express.Router();
router.use(ensureAuthenticated);
router.post("/direct", chatController.getOrCreateDirectChannel);
router.get("/channels", chatController.getAllChannels);
router.get("/channels/:channelId", chatController.getChatChannel);
router.get('/:channelId', chatController.getChannelMessages)
router.post("/", chatController.sendMessage);
router.post("/upload", chatMediaParser.array("files"), chatController.uploadFile);
router.post("/channel", chatController.createChatChannel);
router.put("/channel", chatController.updateChatChannelName);
router.put("/channel/avatar", chatChannelAvatarParser.single("file"), chatController.updateChannelAvatar);
router.put("/channel/moderators", chatController.addModeratorsToChat);
router.put("/channel/members", chatController.addMembersToChatChannel);
router.put("/channel/members/remove", chatController.removeMembersFromChatChannel);
router.delete("/channel/:channelId", chatController.deleteChatChannel);
router.delete("/:messageId", chatController.deleteMessage);

export default router