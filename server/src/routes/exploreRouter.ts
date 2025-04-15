import express from "express";
import deckController from "../controllers/deckController";
const router = express.Router();

router.route("/").get(deckController.getPublicDecks);

export default router;
