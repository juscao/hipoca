import express from "express";
import authRoutes from "./authRouter";
import deckRoutes from "./deckRouter";
import flashcardRoutes from "./flashcardRouter";
import sessionRoutes from "./sessionRouter";
import exploreRoutes from "./exploreRouter";
import authenticateToken from "../middleware/authenticateToken";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/decks", authenticateToken, deckRoutes);
router.use("/cards", authenticateToken, flashcardRoutes);
router.use("/study", authenticateToken, sessionRoutes);
router.use("/explore", authenticateToken, exploreRoutes);

export default router;
