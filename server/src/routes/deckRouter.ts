import express from "express";
import deckController from "../controllers/deckController";
const router = express.Router();

router.route("/new").post(deckController.createDeck);
router.route("/copy").post(deckController.createDeckCopy);
router.route("/all").get(deckController.getAllDecks);
router
  .route("/:deckId")
  .get(deckController.getDeck)
  .delete(deckController.deleteDeck);
router.route("/:deckId/edit").patch(deckController.updateDeck);

export default router;
