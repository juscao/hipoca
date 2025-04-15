import express from "express";
import sessionController from "../controllers/sessionController";
const router = express.Router();

router.route("/session/new").post(sessionController.createSession);
router.route("/session/:sessionId/start").patch(sessionController.startSession);
router
  .route("/session/:sessionId/finish")
  .patch(sessionController.finishSession);

export default router;
