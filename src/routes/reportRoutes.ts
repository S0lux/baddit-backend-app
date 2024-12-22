import express from "express";
import { reportController } from "../controllers/reportController";
import ensureAuthenticated from "../middlewares/ensureAuthenticated";

const router = express.Router();
router.use(ensureAuthenticated);
router.post('/', reportController.createReport);
router.get('/', reportController.getAllReports);
router.patch('/:id/resolve', reportController.resolveReport);
export default router