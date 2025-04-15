import express from "express";
import authController from "../controllers/authController";
import authenticateToken from "../middleware/authenticateToken";
const router = express.Router();

router.route("/").get(authenticateToken, authController.verifyUser);
router.route("/signup").post(authController.signUp);
router.route("/signin").post(authController.signIn);
router.route("/logout").post(authenticateToken, authController.logout);

export default router;
